#!/usr/bin/env node
/**
 * Content Validation Script for Homelab Journal
 *
 * Validates blog content for quality, SEO, and security before publishing.
 *
 * Usage:
 *   node validate-content.js --file content.md
 *   node validate-content.js --file content.md --json
 *   cat content.md | node validate-content.js
 *
 * As module:
 *   const { validate, validateFile } = require('./validate-content');
 *   const result = validate(content);
 */

const fs = require('fs');
const path = require('path');

// Import sanitization patterns from sanitize.js
const { HOSTNAME_MAP, IP_MAP, SENSITIVE_PATTERNS } = require('./sanitize');

// SEO Configuration
const SEO_CONFIG = {
  title: {
    minLength: 20,
    maxLength: 60,
    required: true,
  },
  description: {
    minLength: 50,
    maxLength: 160,
    required: true,
  },
  content: {
    minWords: 300,
    maxWords: 5000,
    minCodeBlocks: 0,
    minHeadings: 2,
  },
};

// Validation result structure
class ValidationResult {
  constructor() {
    this.passed = true;
    this.score = 100;
    this.issues = [];
    this.warnings = [];
    this.checks = {
      frontmatter: { passed: false, issues: [] },
      seo: { passed: false, issues: [], score: 0 },
      sanitization: { passed: false, issues: [] },
      content: { passed: false, issues: [], score: 0 },
      codeBlocks: { passed: false, issues: [] },
    };
  }

  addIssue(category, message, severity = 'error') {
    const issue = { message, severity };
    this.checks[category].issues.push(issue);

    if (severity === 'error') {
      this.issues.push(`[${category}] ${message}`);
      this.passed = false;
      this.score -= 10;
    } else {
      this.warnings.push(`[${category}] ${message}`);
      this.score -= 5;
    }
  }

  finalize() {
    // Mark categories as passed if no errors
    for (const [category, check] of Object.entries(this.checks)) {
      check.passed = !check.issues.some(i => i.severity === 'error');
    }

    // Ensure score doesn't go below 0
    this.score = Math.max(0, this.score);

    return this;
  }
}

/**
 * Parse Hugo frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Handle arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    } else {
      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');
    }

    frontmatter[key] = value;
  }

  return frontmatter;
}

/**
 * Get content body (without frontmatter)
 */
function getContentBody(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n*/, '');
}

/**
 * Validate Hugo frontmatter
 */
function validateFrontmatter(content, result) {
  const frontmatter = parseFrontmatter(content);

  if (!frontmatter) {
    result.addIssue('frontmatter', 'Missing Hugo frontmatter (---)', 'error');
    return;
  }

  // Required fields
  const requiredFields = ['title', 'date'];
  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      result.addIssue('frontmatter', `Missing required field: ${field}`, 'error');
    }
  }

  // Recommended fields
  const recommendedFields = ['tags', 'topics', 'description'];
  for (const field of recommendedFields) {
    if (!frontmatter[field]) {
      result.addIssue('frontmatter', `Missing recommended field: ${field}`, 'warning');
    }
  }

  // Validate date format
  if (frontmatter.date && !/^\d{4}-\d{2}-\d{2}/.test(frontmatter.date)) {
    result.addIssue('frontmatter', `Invalid date format: ${frontmatter.date} (expected YYYY-MM-DD)`, 'error');
  }

  // Validate tags is array
  if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
    result.addIssue('frontmatter', 'Tags should be an array', 'warning');
  }

  // Store frontmatter for other checks
  result.frontmatter = frontmatter;
}

/**
 * Validate SEO factors
 */
function validateSEO(content, result) {
  const frontmatter = result.frontmatter || parseFrontmatter(content);
  const body = getContentBody(content);
  let seoScore = 100;

  // Title length
  if (frontmatter?.title) {
    const titleLength = frontmatter.title.length;
    if (titleLength < SEO_CONFIG.title.minLength) {
      result.addIssue('seo', `Title too short (${titleLength} chars, min ${SEO_CONFIG.title.minLength})`, 'warning');
      seoScore -= 10;
    } else if (titleLength > SEO_CONFIG.title.maxLength) {
      result.addIssue('seo', `Title too long (${titleLength} chars, max ${SEO_CONFIG.title.maxLength})`, 'warning');
      seoScore -= 10;
    }
  }

  // Meta description
  if (frontmatter?.description) {
    const descLength = frontmatter.description.length;
    if (descLength < SEO_CONFIG.description.minLength) {
      result.addIssue('seo', `Description too short (${descLength} chars, min ${SEO_CONFIG.description.minLength})`, 'warning');
      seoScore -= 10;
    } else if (descLength > SEO_CONFIG.description.maxLength) {
      result.addIssue('seo', `Description too long (${descLength} chars, max ${SEO_CONFIG.description.maxLength})`, 'warning');
      seoScore -= 5;
    }
  } else {
    result.addIssue('seo', 'Missing meta description', 'warning');
    seoScore -= 15;
  }

  // Header hierarchy
  const h1Count = (body.match(/^# [^\n]+/gm) || []).length;
  const h2Count = (body.match(/^## [^\n]+/gm) || []).length;
  const h3Count = (body.match(/^### [^\n]+/gm) || []).length;

  if (h1Count > 1) {
    result.addIssue('seo', `Multiple H1 headers found (${h1Count}). Use only one H1.`, 'warning');
    seoScore -= 10;
  }

  if (h2Count < SEO_CONFIG.content.minHeadings) {
    result.addIssue('seo', `Not enough H2 headers (${h2Count}, min ${SEO_CONFIG.content.minHeadings})`, 'warning');
    seoScore -= 10;
  }

  // Check for internal links
  const internalLinks = body.match(/\{\{<\s*relref\s+[^>]+>\}\}/g) || [];
  if (internalLinks.length === 0) {
    result.addIssue('seo', 'No internal links found. Add links to related content.', 'warning');
    seoScore -= 5;
  }

  result.checks.seo.score = Math.max(0, seoScore);
}

/**
 * Validate content is properly sanitized
 */
function validateSanitization(content, result) {
  // Check for private IPs
  const privateIPPatterns = [
    /\b192\.168\.\d{1,3}\.\d{1,3}\b/g,
    /\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    /\b172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}\b/g,
  ];

  for (const pattern of privateIPPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      // Filter out placeholder IPs
      const realIPs = matches.filter(ip => !ip.includes('X'));
      if (realIPs.length > 0) {
        result.addIssue('sanitization', `Found private IP(s): ${realIPs.slice(0, 3).join(', ')}${realIPs.length > 3 ? '...' : ''}`, 'error');
      }
    }
  }

  // Check for known hostnames (lowercase only - role names are Title-Case)
  // Exclude common software names that happen to match hostname patterns
  const SOFTWARE_NAMES = [
    'graylog', 'caddy', 'n8n', 'portainer', 'homarr', 'vaultwarden',
    'semaphore', 'panorama', 'expedition', // These are software, not just hostnames
  ];

  for (const hostname of Object.keys(HOSTNAME_MAP)) {
    // Skip software names - they're legitimate to mention
    if (SOFTWARE_NAMES.includes(hostname.toLowerCase())) continue;

    // Only flag if it looks like it's being used as a hostname (with IP, domain, or in URL context)
    const hostnameContextPattern = new RegExp(
      `\\b${hostname}\\.(mareoxlan|local|lan|home)|` +  // hostname.domain
      `@${hostname}\\b|` +                              // user@hostname
      `ssh.*${hostname}\\b|` +                          // ssh context
      `\\b${hostname}:\\d+\\b`,                         // hostname:port
      'gi'
    );

    if (hostnameContextPattern.test(content)) {
      result.addIssue('sanitization', `Found unsanitized hostname in context: ${hostname}`, 'error');
    }
  }

  // Check for domain
  if (/\bmareoxlan\b/i.test(content)) {
    result.addIssue('sanitization', 'Found "mareoxlan" domain reference', 'error');
  }

  // Check for sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    const match = pattern.exec(content);
    if (match) {
      const truncated = match[0].length > 30 ? match[0].substring(0, 27) + '...' : match[0];
      result.addIssue('sanitization', `Found potential credential: "${truncated}"`, 'error');
    }
  }

  // Check for username
  if (/\bmareox\b/gi.test(content)) {
    result.addIssue('sanitization', 'Found unsanitized username "mareox"', 'error');
  }
}

/**
 * Validate content quality
 */
function validateContent(content, result) {
  const body = getContentBody(content);
  let contentScore = 100;

  // Word count
  const words = body.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (wordCount < SEO_CONFIG.content.minWords) {
    result.addIssue('content', `Content too short (${wordCount} words, min ${SEO_CONFIG.content.minWords})`, 'warning');
    contentScore -= 15;
  } else if (wordCount > SEO_CONFIG.content.maxWords) {
    result.addIssue('content', `Content very long (${wordCount} words). Consider splitting into series.`, 'warning');
    contentScore -= 5;
  }

  // Check for empty sections
  const emptySections = body.match(/^##+ [^\n]+\n\n##/gm);
  if (emptySections) {
    result.addIssue('content', `Found ${emptySections.length} empty section(s)`, 'warning');
    contentScore -= 10;
  }

  // Check for TODO/FIXME comments
  const todos = body.match(/\b(TODO|FIXME|XXX|HACK)\b/gi);
  if (todos) {
    result.addIssue('content', `Found ${todos.length} TODO/FIXME comment(s)`, 'warning');
    contentScore -= 5;
  }

  // Check for placeholder text
  const placeholders = body.match(/\[.*?\](?!\()/g) || [];
  const suspiciousPlaceholders = placeholders.filter(p =>
    /\[(insert|add|your|placeholder|description|title|content)\]/i.test(p)
  );
  if (suspiciousPlaceholders.length > 0) {
    result.addIssue('content', `Found placeholder text: ${suspiciousPlaceholders.slice(0, 2).join(', ')}`, 'error');
    contentScore -= 15;
  }

  result.checks.content.score = Math.max(0, contentScore);
  result.checks.content.wordCount = wordCount;
}

/**
 * Validate code blocks
 */
function validateCodeBlocks(content, result) {
  const body = getContentBody(content);

  // Find all code blocks
  const codeBlocks = body.match(/```[\s\S]*?```/g) || [];

  if (codeBlocks.length === 0) {
    // Not an error for non-tutorial content
    result.addIssue('codeBlocks', 'No code blocks found', 'warning');
    return;
  }

  let blocksWithoutLang = 0;
  let blocksWithErrors = 0;

  for (const block of codeBlocks) {
    // Check for language tag
    const langMatch = block.match(/^```(\w*)/);
    if (!langMatch || !langMatch[1]) {
      blocksWithoutLang++;
    }

    // Check for common syntax errors in bash blocks
    if (/^```(bash|sh)/i.test(block)) {
      // Check for unclosed quotes
      const content = block.slice(block.indexOf('\n'), -3);
      const singleQuotes = (content.match(/'/g) || []).length;
      const doubleQuotes = (content.match(/"/g) || []).length;

      if (singleQuotes % 2 !== 0) {
        result.addIssue('codeBlocks', 'Bash block has unclosed single quote', 'warning');
        blocksWithErrors++;
      }
      if (doubleQuotes % 2 !== 0) {
        result.addIssue('codeBlocks', 'Bash block has unclosed double quote', 'warning');
        blocksWithErrors++;
      }
    }

    // Check for YAML blocks with tabs (YAML doesn't allow tabs)
    if (/^```ya?ml/i.test(block)) {
      if (/\t/.test(block)) {
        result.addIssue('codeBlocks', 'YAML block contains tabs (use spaces)', 'error');
        blocksWithErrors++;
      }
    }
  }

  if (blocksWithoutLang > 0) {
    result.addIssue('codeBlocks', `${blocksWithoutLang} code block(s) missing language tag`, 'warning');
  }

  result.checks.codeBlocks.count = codeBlocks.length;
  result.checks.codeBlocks.withoutLang = blocksWithoutLang;
  result.checks.codeBlocks.withErrors = blocksWithErrors;
}

/**
 * Main validation function
 */
function validate(content, options = {}) {
  const result = new ValidationResult();

  // Run all validators
  validateFrontmatter(content, result);
  validateSEO(content, result);
  validateSanitization(content, result);
  validateContent(content, result);
  validateCodeBlocks(content, result);

  return result.finalize();
}

/**
 * Validate a file
 */
function validateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const result = validate(content);
  result.filePath = filePath;

  return result;
}

/**
 * Format validation result for display
 */
function formatResult(result) {
  let output = '';

  // Header
  const status = result.passed ? '✅ PASSED' : '❌ FAILED';
  output += `\n${status} (Score: ${result.score}/100)\n`;
  output += '─'.repeat(50) + '\n';

  // Category summaries
  for (const [category, check] of Object.entries(result.checks)) {
    const icon = check.passed ? '✓' : '✗';
    const scoreStr = check.score !== undefined ? ` (${check.score}/100)` : '';
    output += `\n${icon} ${category.toUpperCase()}${scoreStr}\n`;

    for (const issue of check.issues) {
      const prefix = issue.severity === 'error' ? '  ✗' : '  ⚠';
      output += `${prefix} ${issue.message}\n`;
    }

    if (check.issues.length === 0) {
      output += '  No issues\n';
    }
  }

  // Summary
  output += '\n' + '─'.repeat(50) + '\n';
  output += `Errors: ${result.issues.length} | Warnings: ${result.warnings.length}\n`;

  return output;
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Content Validation for Homelab Journal

Usage:
  node validate-content.js --file <path>    Validate a file
  node validate-content.js --json           Output as JSON
  cat content.md | node validate-content.js Validate from stdin

Options:
  --file, -f <path>   File to validate
  --json              Output as JSON
  --quiet, -q         Only output if validation fails
  --help, -h          Show this help

Exit codes:
  0 = Validation passed
  1 = Validation failed
  2 = Error (file not found, etc.)
`);
    process.exit(0);
  }

  const fileIdx = args.findIndex(a => a === '--file' || a === '-f');
  const jsonOutput = args.includes('--json');
  const quiet = args.includes('--quiet') || args.includes('-q');

  let result;

  try {
    if (fileIdx !== -1 && args[fileIdx + 1]) {
      result = validateFile(args[fileIdx + 1]);
    } else if (!process.stdin.isTTY) {
      const content = fs.readFileSync(0, 'utf8');
      result = validate(content);
    } else {
      console.error('Error: No input provided. Use --file or pipe content.');
      process.exit(2);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(2);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else if (!quiet || !result.passed) {
    console.log(formatResult(result));
  }

  process.exit(result.passed ? 0 : 1);
}

module.exports = {
  validate,
  validateFile,
  formatResult,
  ValidationResult,
  SEO_CONFIG,
};
