#!/usr/bin/env node
/**
 * SEO Enhancement and Internal Linking for Homelab Journal
 *
 * Analyzes content for SEO optimization opportunities and suggests internal links.
 *
 * Usage:
 *   node seo-enhance.js --file content/posts/2026/my-post.md
 *   node seo-enhance.js --content "..." --topics "docker,proxmox"
 *   node seo-enhance.js --scan  # Build link index
 *
 * As module:
 *   const { analyzeContent, suggestLinks, buildLinkIndex } = require('./seo-enhance');
 */

const fs = require('fs');
const path = require('path');

const JOURNAL_PATH = '/home/mareox/GIT/homelab-journal';
const CONTENT_PATH = path.join(JOURNAL_PATH, 'content');

// SEO Constants
const SEO_RULES = {
  title: { min: 20, max: 60, ideal: '30-55 characters' },
  description: { min: 50, max: 160, ideal: '120-155 characters' },
  minWordCount: 300,
  idealWordCount: 800,
  maxH1: 1,
  minH2: 2,
  keywordDensity: { min: 0.5, max: 2.5 }, // percentage
};

// Common homelab keywords for analysis
const HOMELAB_KEYWORDS = [
  'proxmox',
  'docker',
  'container',
  'kubernetes',
  'k8s',
  'lxc',
  'vm',
  'virtual machine',
  'homelab',
  'self-hosted',
  'pi-hole',
  'pihole',
  'dns',
  'networking',
  'firewall',
  'reverse proxy',
  'caddy',
  'nginx',
  'traefik',
  'unifi',
  'vlan',
  'nas',
  'synology',
  'backup',
  'monitoring',
  'grafana',
  'prometheus',
  'graylog',
  'logging',
  'ansible',
  'automation',
  'n8n',
  'workflow',
  'security',
  'ssl',
  'tls',
  'certificate',
  'vaultwarden',
  'bitwarden',
];

/**
 * Parse Hugo frontmatter from content
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: null, body: content };

  const fm = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let inArray = false;

  for (const line of lines) {
    if (line.match(/^\s*-\s/)) {
      // Array item
      if (currentKey && inArray) {
        const val = line.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '');
        if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
        fm[currentKey].push(val);
      }
      continue;
    }

    const idx = line.indexOf(':');
    if (idx === -1) continue;

    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();

    if (val === '') {
      // Start of array or nested object
      inArray = true;
      currentKey = key;
      continue;
    }

    inArray = false;
    currentKey = key;

    // Parse inline arrays
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^["']|["']$/g, ''));
    } else {
      val = val.replace(/^["']|["']$/g, '');
    }

    fm[key] = val;
  }

  const body = content.replace(/^---\n[\s\S]*?\n---\n*/, '');
  return { frontmatter: fm, body };
}

/**
 * Build index of all content for internal linking
 */
function buildLinkIndex() {
  const index = [];

  function scanDir(dir, baseUrl = '') {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath, `${baseUrl}/${entry.name}`);
      } else if (entry.name.endsWith('.md') && entry.name !== '_index.md') {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const { frontmatter, body } = parseFrontmatter(content);

          if (!frontmatter) continue;

          // Skip drafts
          if (frontmatter.draft === 'true' || frontmatter.draft === true) continue;

          // Build URL from file path
          let url = fullPath
            .replace(CONTENT_PATH, '')
            .replace(/\.md$/, '')
            .replace(/\/index$/, '');

          // Collect keywords from title, tags, topics, and content
          const keywords = new Set();

          // From title
          if (frontmatter.title) {
            frontmatter.title
              .toLowerCase()
              .split(/\W+/)
              .filter(w => w.length > 3)
              .forEach(w => keywords.add(w));
          }

          // From tags and topics
          const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
          const topics = Array.isArray(frontmatter.topics) ? frontmatter.topics : [];
          [...tags, ...topics].forEach(t => keywords.add(t.toLowerCase()));

          // From body (limited scan)
          const bodyLower = body.toLowerCase();
          HOMELAB_KEYWORDS.forEach(kw => {
            if (bodyLower.includes(kw.toLowerCase())) {
              keywords.add(kw.toLowerCase());
            }
          });

          index.push({
            title: frontmatter.title || path.basename(fullPath, '.md'),
            url,
            path: fullPath,
            tags,
            topics,
            keywords: Array.from(keywords),
            description: frontmatter.description || '',
            date: frontmatter.date || '',
          });
        } catch (e) {
          // Skip files that can't be parsed
        }
      }
    }
  }

  scanDir(CONTENT_PATH);
  return index;
}

/**
 * Analyze content for SEO issues
 */
function analyzeContent(content, options = {}) {
  const { frontmatter, body } = parseFrontmatter(content);
  const issues = [];
  const warnings = [];
  const suggestions = [];
  let score = 100;

  // Title analysis
  if (!frontmatter?.title) {
    issues.push('Missing title');
    score -= 20;
  } else {
    const titleLen = frontmatter.title.length;
    if (titleLen < SEO_RULES.title.min) {
      warnings.push(`Title too short (${titleLen} chars, min ${SEO_RULES.title.min})`);
      score -= 5;
    } else if (titleLen > SEO_RULES.title.max) {
      warnings.push(`Title too long (${titleLen} chars, max ${SEO_RULES.title.max})`);
      score -= 5;
    }
  }

  // Description analysis
  if (!frontmatter?.description) {
    issues.push('Missing meta description');
    score -= 15;
  } else {
    const descLen = frontmatter.description.length;
    if (descLen < SEO_RULES.description.min) {
      warnings.push(`Description too short (${descLen} chars, min ${SEO_RULES.description.min})`);
      score -= 5;
    } else if (descLen > SEO_RULES.description.max) {
      warnings.push(`Description too long (${descLen} chars, max ${SEO_RULES.description.max})`);
      score -= 5;
    }
  }

  // Header analysis
  const h1Count = (body.match(/^# [^\n]+/gm) || []).length;
  const h2Count = (body.match(/^## [^\n]+/gm) || []).length;
  const h3Count = (body.match(/^### [^\n]+/gm) || []).length;

  if (h1Count > SEO_RULES.maxH1) {
    warnings.push(`Multiple H1 headers (${h1Count}, should be max ${SEO_RULES.maxH1})`);
    score -= 5;
  }

  if (h2Count < SEO_RULES.minH2) {
    warnings.push(`Few H2 headers (${h2Count}, recommend min ${SEO_RULES.minH2})`);
    score -= 5;
  }

  // Word count analysis
  const words = body.split(/\s+/).filter(w => w && !w.match(/^[#*`\->\[\]]/)).length;
  if (words < SEO_RULES.minWordCount) {
    warnings.push(`Content too short (${words} words, min ${SEO_RULES.minWordCount})`);
    score -= 10;
  } else if (words < SEO_RULES.idealWordCount) {
    suggestions.push(`Consider expanding content (${words} words, ideal ${SEO_RULES.idealWordCount}+)`);
  }

  // Keyword analysis
  const contentLower = (frontmatter?.title + ' ' + body).toLowerCase();
  const foundKeywords = HOMELAB_KEYWORDS.filter(kw => contentLower.includes(kw.toLowerCase()));

  if (foundKeywords.length === 0) {
    warnings.push('No common homelab keywords found');
    score -= 5;
  }

  // Tags/topics check
  const hasTags = Array.isArray(frontmatter?.tags) && frontmatter.tags.length > 0;
  const hasTopics = Array.isArray(frontmatter?.topics) && frontmatter.topics.length > 0;

  if (!hasTags) {
    issues.push('Missing tags');
    score -= 10;
  }

  if (!hasTopics) {
    warnings.push('Missing topics taxonomy');
    score -= 5;
  }

  // Internal link check
  const internalLinks = body.match(/\{\{<\s*relref\s*"[^"]+"\s*>\}\}/g) || [];
  const markdownLinks = body.match(/\]\(\/[^)]+\)/g) || [];
  const totalInternalLinks = internalLinks.length + markdownLinks.length;

  if (totalInternalLinks === 0) {
    suggestions.push('Add internal links to related content');
  }

  // Code block analysis
  const codeBlocks = body.match(/```[\s\S]*?```/g) || [];
  const codeBlocksNoLang = codeBlocks.filter(b => /^```\s*\n/.test(b)).length;

  if (codeBlocksNoLang > 0) {
    warnings.push(`${codeBlocksNoLang} code blocks missing language specification`);
    score -= 3;
  }

  // Image alt text check
  const images = body.match(/!\[[^\]]*\]\([^)]+\)/g) || [];
  const imagesNoAlt = images.filter(img => /!\[\]\(/.test(img)).length;

  if (imagesNoAlt > 0) {
    warnings.push(`${imagesNoAlt} images missing alt text`);
    score -= 3;
  }

  return {
    score: Math.max(0, score),
    qualityLevel: score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'needs_work' : 'poor',
    issues,
    warnings,
    suggestions,
    stats: {
      wordCount: words,
      h1Count,
      h2Count,
      h3Count,
      codeBlocks: codeBlocks.length,
      internalLinks: totalInternalLinks,
      images: images.length,
    },
    keywords: foundKeywords,
    frontmatter: frontmatter
      ? {
          title: frontmatter.title,
          description: frontmatter.description,
          tags: frontmatter.tags,
          topics: frontmatter.topics,
        }
      : null,
  };
}

/**
 * Suggest internal links based on content
 */
function suggestLinks(content, options = {}) {
  const { maxSuggestions = 5, excludePaths = [] } = options;

  // Build or load link index
  const index = options.index || buildLinkIndex();

  // Parse content
  const { frontmatter, body } = parseFrontmatter(content);
  const contentLower = ((frontmatter?.title || '') + ' ' + body).toLowerCase();

  // Get content keywords
  const contentKeywords = new Set();
  HOMELAB_KEYWORDS.forEach(kw => {
    if (contentLower.includes(kw.toLowerCase())) {
      contentKeywords.add(kw.toLowerCase());
    }
  });

  // Add tags and topics
  const tags = Array.isArray(frontmatter?.tags) ? frontmatter.tags : [];
  const topics = Array.isArray(frontmatter?.topics) ? frontmatter.topics : [];
  [...tags, ...topics].forEach(t => contentKeywords.add(t.toLowerCase()));

  // Score each indexed page
  const scored = index
    .filter(page => !excludePaths.includes(page.path))
    .map(page => {
      let score = 0;

      // Keyword overlap
      const overlap = page.keywords.filter(k => contentKeywords.has(k));
      score += overlap.length * 10;

      // Tag/topic match
      const tagMatch = page.tags.filter(t => tags.includes(t) || topics.includes(t.toLowerCase()));
      score += tagMatch.length * 15;

      const topicMatch = page.topics.filter(t => topics.includes(t) || tags.includes(t.toLowerCase()));
      score += topicMatch.length * 15;

      // Title word match
      if (frontmatter?.title) {
        const titleWords = frontmatter.title.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        const pageTitleWords = page.title.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        const titleOverlap = titleWords.filter(w => pageTitleWords.includes(w));
        score += titleOverlap.length * 5;
      }

      return { ...page, score, matchedKeywords: overlap };
    })
    .filter(page => page.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions);

  // Generate link suggestions
  return scored.map(page => ({
    title: page.title,
    url: page.url,
    relevance: page.score,
    matchedKeywords: page.matchedKeywords,
    hugoLink: `{{< relref "${page.url}" >}}`,
    markdown: `[${page.title}]({{< relref "${page.url}" >}})`,
  }));
}

/**
 * Generate SEO-optimized description from content
 */
function generateDescription(content, maxLength = 155) {
  const { body } = parseFrontmatter(content);

  // Get first meaningful paragraph (skip headers, code blocks)
  const paragraphs = body
    .split('\n\n')
    .filter(p => !p.startsWith('#') && !p.startsWith('```') && !p.startsWith('>')  && p.trim().length > 50);

  if (paragraphs.length === 0) return '';

  let desc = paragraphs[0]
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
    .replace(/[*_`]/g, '') // Remove formatting
    .replace(/\s+/g, ' ')
    .trim();

  if (desc.length > maxLength) {
    desc = desc.substring(0, maxLength - 3).replace(/\s+\S*$/, '') + '...';
  }

  return desc;
}

/**
 * Get improvement recommendations
 */
function getRecommendations(analysis) {
  const recommendations = [];

  if (analysis.issues.length > 0) {
    recommendations.push({
      priority: 'high',
      category: 'required',
      items: analysis.issues,
    });
  }

  if (analysis.warnings.length > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'recommended',
      items: analysis.warnings,
    });
  }

  if (analysis.suggestions.length > 0) {
    recommendations.push({
      priority: 'low',
      category: 'optional',
      items: analysis.suggestions,
    });
  }

  return recommendations;
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
SEO Enhancement and Internal Linking

Usage:
  node seo-enhance.js [options]

Options:
  --file <path>        Analyze a content file
  --content <text>     Analyze content text
  --scan               Build and display link index
  --suggest-links      Include link suggestions in output
  --max-links <n>      Max link suggestions (default: 5)
  --json               Output as JSON
  --help, -h           Show this help

Examples:
  node seo-enhance.js --file content/posts/2026/my-post.md
  node seo-enhance.js --file content/tutorials/guide.md --suggest-links
  node seo-enhance.js --scan --json
`);
    process.exit(0);
  }

  // Scan mode
  if (args.includes('--scan')) {
    const index = buildLinkIndex();
    if (args.includes('--json')) {
      console.log(JSON.stringify(index, null, 2));
    } else {
      console.log(`Found ${index.length} content pages:\n`);
      index.forEach(page => {
        console.log(`  ${page.title}`);
        console.log(`    URL: ${page.url}`);
        console.log(`    Keywords: ${page.keywords.slice(0, 5).join(', ')}`);
        console.log('');
      });
    }
    process.exit(0);
  }

  // Get content
  function getArg(name) {
    const idx = args.findIndex(a => a === `--${name}`);
    return idx !== -1 ? args[idx + 1] : null;
  }

  let content;
  const filePath = getArg('file');

  if (filePath) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(JSON.stringify({ error: `File not found: ${fullPath}` }));
      process.exit(1);
    }
    content = fs.readFileSync(fullPath, 'utf8');
  } else if (getArg('content')) {
    content = getArg('content');
  } else {
    console.error('Error: --file or --content required');
    process.exit(1);
  }

  // Analyze
  const analysis = analyzeContent(content);
  const recommendations = getRecommendations(analysis);

  // Link suggestions
  let links = [];
  if (args.includes('--suggest-links')) {
    const maxLinks = parseInt(getArg('max-links') || '5', 10);
    const excludePaths = filePath ? [path.resolve(filePath)] : [];
    links = suggestLinks(content, { maxSuggestions: maxLinks, excludePaths });
  }

  // Output
  const result = {
    ...analysis,
    recommendations,
    suggestedLinks: links,
    generatedDescription: analysis.frontmatter?.description ? null : generateDescription(content),
  };

  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('\n📊 SEO Analysis Report\n');
    console.log(`Score: ${result.score}/100 (${result.qualityLevel})`);
    console.log(`Words: ${result.stats.wordCount} | Headers: H1=${result.stats.h1Count}, H2=${result.stats.h2Count}`);
    console.log(`Keywords found: ${result.keywords.join(', ') || 'none'}\n`);

    if (result.issues.length > 0) {
      console.log('❌ Issues (must fix):');
      result.issues.forEach(i => console.log(`   - ${i}`));
      console.log('');
    }

    if (result.warnings.length > 0) {
      console.log('⚠️ Warnings:');
      result.warnings.forEach(w => console.log(`   - ${w}`));
      console.log('');
    }

    if (result.suggestions.length > 0) {
      console.log('💡 Suggestions:');
      result.suggestions.forEach(s => console.log(`   - ${s}`));
      console.log('');
    }

    if (links.length > 0) {
      console.log('🔗 Suggested Internal Links:');
      links.forEach(link => {
        console.log(`   - ${link.title} (relevance: ${link.relevance})`);
        console.log(`     ${link.markdown}`);
      });
      console.log('');
    }

    if (result.generatedDescription) {
      console.log('📝 Suggested Description:');
      console.log(`   "${result.generatedDescription}"`);
      console.log('');
    }
  }

  process.exit(result.issues.length > 0 ? 1 : 0);
}

module.exports = {
  analyzeContent,
  suggestLinks,
  buildLinkIndex,
  generateDescription,
  getRecommendations,
  parseFrontmatter,
  SEO_RULES,
  HOMELAB_KEYWORDS,
};
