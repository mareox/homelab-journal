#!/usr/bin/env node
/**
 * Git Commit Analyzer for Homelab Journal
 *
 * Scans homelab-infra git log and extracts topic suggestions
 * for blog post generation.
 *
 * Usage:
 *   node analyze-commits.js                     # Last 24 hours
 *   node analyze-commits.js --since "1 week"    # Custom time range
 *   node analyze-commits.js --json              # Output as JSON
 */

const { execSync } = require('child_process');
const path = require('path');

// Configuration
const HOMELAB_INFRA_PATH = '/mnt/d/GIT/homelab-infra';

// Directory to topic mapping
const DIRECTORY_TOPICS = {
  'pihole': { topics: ['dns', 'networking', 'high-availability'], types: ['tutorial', 'architecture'] },
  'proxmox': { topics: ['virtualization', 'containers', 'backup'], types: ['tutorial', 'lesson-learned'] },
  'graylog': { topics: ['monitoring', 'logging', 'docker'], types: ['tutorial'] },
  'unifi': { topics: ['networking', 'wifi'], types: ['lab-note'] },
  'pod-': { topics: ['docker', 'self-hosted'], types: ['tutorial'] },
  'scripts': { topics: ['automation', 'bash'], types: ['lab-note'] },
  'py_': { topics: ['python', 'automation'], types: ['tutorial'] },
  'palo-alto': { topics: ['firewall', 'security'], types: ['tutorial', 'architecture'] },
};

// Commit message patterns
const COMMIT_PATTERNS = [
  { pattern: /^fix[:\(]|bugfix|resolve/i, intent: 'fix', suggestedType: 'lesson-learned' },
  { pattern: /^feat[:\(]|add[:\s]|implement/i, intent: 'feature', suggestedType: 'tutorial' },
  { pattern: /^refactor|improve|enhance|optimize/i, intent: 'improve', suggestedType: 'lab-note' },
  { pattern: /^docs[:\(]|document/i, intent: 'docs', suggestedType: 'skip' },
  { pattern: /^chore[:\(]|maintenance|update deps/i, intent: 'chore', suggestedType: 'journal' },
  { pattern: /^test[:\(]/i, intent: 'test', suggestedType: 'skip' },
  { pattern: /setup|install|configure|deploy/i, intent: 'setup', suggestedType: 'tutorial' },
  { pattern: /migrate|migration/i, intent: 'migration', suggestedType: 'lesson-learned' },
];

/**
 * Run git command in homelab-infra directory
 */
function git(command) {
  try {
    return execSync(`git ${command}`, {
      cwd: HOMELAB_INFRA_PATH,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
  } catch (error) {
    console.error(`Git command failed: git ${command}`);
    console.error(error.message);
    return '';
  }
}

/**
 * Get commits since a given time
 */
function getCommits(since = '24 hours ago') {
  const logFormat = '%H|%s|%ai|%an';
  const output = git(`log --since="${since}" --format="${logFormat}"`);

  if (!output) return [];

  return output.split('\n').filter(Boolean).map(line => {
    const [hash, message, date, author] = line.split('|');
    return { hash, message, date, author };
  });
}

/**
 * Get files changed in a commit
 */
function getChangedFiles(commitHash) {
  const output = git(`diff-tree --no-commit-id --name-status -r ${commitHash}`);

  if (!output) return [];

  return output.split('\n').filter(Boolean).map(line => {
    const [status, ...pathParts] = line.split('\t');
    const filePath = pathParts.join('\t'); // Handle paths with tabs (rare but possible)
    return { status, path: filePath };
  });
}

/**
 * Detect topics from file paths
 */
function detectTopics(files) {
  const topics = new Set();
  const suggestedTypes = new Set();

  for (const file of files) {
    for (const [dirPattern, config] of Object.entries(DIRECTORY_TOPICS)) {
      if (file.path.toLowerCase().includes(dirPattern.toLowerCase())) {
        config.topics.forEach(t => topics.add(t));
        config.types.forEach(t => suggestedTypes.add(t));
      }
    }
  }

  return {
    topics: Array.from(topics),
    suggestedTypes: Array.from(suggestedTypes),
  };
}

/**
 * Detect intent from commit message
 */
function detectIntent(message) {
  for (const { pattern, intent, suggestedType } of COMMIT_PATTERNS) {
    if (pattern.test(message)) {
      return { intent, suggestedType };
    }
  }
  return { intent: 'general', suggestedType: 'journal' };
}

/**
 * Group commits by subsystem (top-level directory)
 */
function groupBySubsystem(commits) {
  const groups = {};

  for (const commit of commits) {
    const files = getChangedFiles(commit.hash);

    for (const file of files) {
      const parts = file.path.split('/');
      const subsystem = parts[0] || 'root';

      if (!groups[subsystem]) {
        groups[subsystem] = {
          commits: [],
          files: new Set(),
          ...detectTopics([file]),
        };
      }

      if (!groups[subsystem].commits.find(c => c.hash === commit.hash)) {
        groups[subsystem].commits.push(commit);
      }
      groups[subsystem].files.add(file.path);
    }
  }

  // Convert Sets to Arrays and calculate stats
  for (const [key, group] of Object.entries(groups)) {
    group.files = Array.from(group.files);
    group.fileCount = group.files.length;
    group.commitCount = group.commits.length;
  }

  return groups;
}

/**
 * Generate topic suggestions ranked by significance
 */
function generateSuggestions(groups) {
  const suggestions = [];

  for (const [subsystem, group] of Object.entries(groups)) {
    // Skip meta directories
    if (['_c-docs', '_c-archive', '.git'].includes(subsystem)) continue;

    // Calculate significance score
    const recencyScore = group.commits.length * 10;
    const complexityScore = group.fileCount * 5;
    const noveltyScore = subsystem.startsWith('pod-') ? 15 : 0;
    const score = recencyScore + complexityScore + noveltyScore;

    // Detect primary intent from most recent commit
    const latestCommit = group.commits[0];
    const { intent, suggestedType } = detectIntent(latestCommit.message);

    // Skip if it's just docs or tests
    if (suggestedType === 'skip') continue;

    // Generate title suggestion
    let title = '';
    if (suggestedType === 'lesson-learned') {
      title = `Lesson Learned: ${extractKeyPhrase(latestCommit.message)}`;
    } else if (suggestedType === 'tutorial') {
      title = `How to ${extractKeyPhrase(latestCommit.message)}`;
    } else {
      title = extractKeyPhrase(latestCommit.message);
    }

    suggestions.push({
      subsystem,
      title,
      type: suggestedType,
      topics: group.topics,
      commits: group.commitCount,
      files: group.fileCount,
      score,
      confidence: Math.min(100, score),
      latestCommit: latestCommit.message,
      fileList: group.files.slice(0, 5), // Top 5 files
    });
  }

  // Sort by score descending
  suggestions.sort((a, b) => b.score - a.score);

  return suggestions;
}

/**
 * Extract key phrase from commit message for title
 */
function extractKeyPhrase(message) {
  // Remove conventional commit prefixes
  let phrase = message
    .replace(/^(fix|feat|docs|chore|refactor|test|style|perf|ci|build)(\(.+?\))?:\s*/i, '')
    .replace(/^(add|update|remove|fix|implement|configure|setup)\s+/i, '')
    .trim();

  // Capitalize first letter
  phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1);

  // Truncate if too long
  if (phrase.length > 60) {
    phrase = phrase.substring(0, 57) + '...';
  }

  return phrase;
}

/**
 * Format suggestions for display
 */
function formatSuggestions(suggestions) {
  let output = '';

  suggestions.forEach((s, i) => {
    output += `\n${i + 1}. [${s.type}] ${s.title}\n`;
    output += `   Commits: ${s.commits} | Files: ${s.files} | Confidence: ${s.confidence}%\n`;
    output += `   Topics: ${s.topics.join(', ')}\n`;
    output += `   Subsystem: ${s.subsystem}/\n`;
    if (s.fileList.length > 0) {
      output += `   Key files: ${s.fileList.slice(0, 3).join(', ')}\n`;
    }
  });

  return output;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  // Parse arguments
  const sinceIdx = args.findIndex(a => a === '--since');
  const since = sinceIdx !== -1 ? args[sinceIdx + 1] : '24 hours ago';
  const jsonOutput = args.includes('--json');
  const verbose = args.includes('--verbose') || args.includes('-v');

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Git Commit Analyzer for Homelab Journal

Usage:
  node analyze-commits.js [options]

Options:
  --since <time>    Time range (default: "24 hours ago")
  --json            Output as JSON
  --verbose, -v     Show detailed output
  --help, -h        Show this help

Examples:
  node analyze-commits.js --since "1 week ago"
  node analyze-commits.js --json | jq '.suggestions[0]'
`);
    process.exit(0);
  }

  console.error(`Scanning homelab-infra for commits since "${since}"...`);

  const commits = getCommits(since);

  if (commits.length === 0) {
    console.error('No commits found in the specified time range.');
    process.exit(0);
  }

  console.error(`Found ${commits.length} commits.`);

  const groups = groupBySubsystem(commits);
  const suggestions = generateSuggestions(groups);

  if (jsonOutput) {
    console.log(JSON.stringify({
      since,
      totalCommits: commits.length,
      subsystems: Object.keys(groups),
      suggestions,
    }, null, 2));
  } else {
    console.log(`\nAnalyzed ${commits.length} commits across ${Object.keys(groups).length} subsystems.`);
    console.log('\n=== Topic Suggestions ===');
    console.log(formatSuggestions(suggestions.slice(0, 5)));

    if (verbose && suggestions.length > 5) {
      console.log('\n=== Additional Topics ===');
      console.log(formatSuggestions(suggestions.slice(5)));
    }
  }
}

module.exports = {
  getCommits,
  getChangedFiles,
  detectTopics,
  detectIntent,
  groupBySubsystem,
  generateSuggestions,
  DIRECTORY_TOPICS,
  COMMIT_PATTERNS,
};
