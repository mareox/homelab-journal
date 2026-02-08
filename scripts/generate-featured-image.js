#!/usr/bin/env node
/**
 * Featured Image Generator for Homelab Journal
 *
 * Generates blog featured images using Nano Banana (Gemini CLI extension).
 *
 * Usage:
 *   node generate-featured-image.js --title "Post Title" --topics "docker,proxmox" --type journal --slug my-post
 *   node generate-featured-image.js --json '{"title":"...", "topics":["docker"], "postType":"tutorial", "slug":"..."}'
 *
 * As module:
 *   const { generateFeaturedImage, buildPrompt } = require('./generate-featured-image');
 *   const result = await generateFeaturedImage({ title, topics, postType, slug });
 */

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

const JOURNAL_PATH = '/home/mareox/GIT/homelab-journal';
const IMAGES_PATH = path.join(JOURNAL_PATH, 'static', 'images');
const OUTPUT_DIR = path.join(JOURNAL_PATH, 'nanobanana-output');

// Topic to visual theme mapping
const TOPIC_THEMES = {
  // Infrastructure
  proxmox: { subject: 'server virtualization', style: 'tech diagram', colors: 'blue and orange' },
  docker: { subject: 'container orchestration', style: 'modern tech', colors: 'blue gradient' },
  kubernetes: { subject: 'container clusters', style: 'network diagram', colors: 'blue and white' },
  lxc: { subject: 'linux containers', style: 'minimalist tech', colors: 'teal and gray' },

  // Networking
  networking: { subject: 'network topology', style: 'technical diagram', colors: 'blue and cyan' },
  dns: { subject: 'DNS resolution', style: 'flow diagram', colors: 'green and blue' },
  pihole: { subject: 'network ad blocking', style: 'shield icon', colors: 'red and black' },
  firewall: { subject: 'network security', style: 'protective barrier', colors: 'red and orange' },
  unifi: { subject: 'network management', style: 'dashboard view', colors: 'blue gradient' },

  // Monitoring & Logging
  monitoring: { subject: 'system metrics', style: 'dashboard graphs', colors: 'green and blue' },
  graylog: { subject: 'log aggregation', style: 'data streams', colors: 'gray and green' },
  prometheus: { subject: 'metrics collection', style: 'time series graph', colors: 'orange and white' },
  grafana: { subject: 'data visualization', style: 'dashboard panels', colors: 'orange gradient' },

  // Security
  security: { subject: 'cybersecurity', style: 'shield and lock', colors: 'green and black' },
  vaultwarden: { subject: 'password management', style: 'vault door', colors: 'blue and silver' },
  certificates: { subject: 'SSL/TLS encryption', style: 'certificate badge', colors: 'green and gold' },

  // Automation
  automation: { subject: 'workflow automation', style: 'connected nodes', colors: 'purple and blue' },
  n8n: { subject: 'workflow automation', style: 'node graph', colors: 'coral and white' },
  ansible: { subject: 'configuration automation', style: 'playbook', colors: 'red and black' },

  // Storage
  storage: { subject: 'data storage', style: 'disk arrays', colors: 'blue and silver' },
  nas: { subject: 'network storage', style: 'disk enclosure', colors: 'gray and blue' },
  backup: { subject: 'data backup', style: 'cloud sync', colors: 'green and blue' },

  // General
  homelab: { subject: 'home server rack', style: 'tech illustration', colors: 'blue and purple' },
  linux: { subject: 'linux penguin', style: 'mascot illustration', colors: 'yellow and black' },
};

// Post type to visual style mapping
const TYPE_STYLES = {
  journal: {
    style: 'changelog illustration',
    mood: 'productive, focused',
    elements: 'terminal window, code snippets',
  },
  tutorial: {
    style: 'step-by-step guide',
    mood: 'educational, clear',
    elements: 'numbered steps, hands-on',
  },
  'lesson-learned': {
    style: 'lightbulb moment',
    mood: 'insightful, reflective',
    elements: 'puzzle pieces, solution',
  },
  architecture: {
    style: 'technical blueprint',
    mood: 'structured, professional',
    elements: 'diagram boxes, connections',
  },
};

/**
 * Check if Gemini CLI and nanobanana extension are available
 */
function checkDependencies() {
  try {
    execSync('which gemini', { encoding: 'utf8', stdio: 'pipe' });
  } catch {
    return {
      available: false,
      error: 'Gemini CLI not found. Install from: https://github.com/google-gemini/gemini-cli',
    };
  }

  try {
    const extensions = execSync('gemini extensions list', { encoding: 'utf8', stdio: 'pipe' });
    if (!extensions.toLowerCase().includes('nanobanana')) {
      return {
        available: false,
        error:
          'nanobanana extension not installed. Run: gemini extensions install https://github.com/gemini-cli-extensions/nanobanana',
      };
    }
  } catch {
    return {
      available: false,
      error: 'Could not check Gemini extensions. Ensure Gemini CLI is properly configured.',
    };
  }

  // Check API key
  if (!process.env.GEMINI_API_KEY) {
    return {
      available: false,
      error: 'GEMINI_API_KEY environment variable not set.',
    };
  }

  return { available: true };
}

/**
 * Build image generation prompt from post metadata
 */
function buildPrompt(options) {
  const { title, topics = [], postType = 'journal' } = options;

  // Get primary topic theme
  const primaryTopic = topics[0]?.toLowerCase() || 'homelab';
  const theme = TOPIC_THEMES[primaryTopic] || TOPIC_THEMES.homelab;

  // Get post type style
  const typeStyle = TYPE_STYLES[postType] || TYPE_STYLES.journal;

  // Build descriptive prompt
  const promptParts = [
    `Professional blog featured image for homelab tech article titled "${title}".`,
    `Subject: ${theme.subject}.`,
    `Visual style: ${typeStyle.style}, ${theme.style}.`,
    `Color scheme: ${theme.colors}.`,
    `Mood: ${typeStyle.mood}.`,
    `Include visual elements suggesting: ${typeStyle.elements}.`,
    'Modern flat illustration style, clean composition.',
    'Aspect ratio 1200x630 for social media preview.',
    'No text or words in the image.',
    'Professional, polished look suitable for technical blog.',
  ];

  return promptParts.join(' ');
}

/**
 * Generate featured image using Nano Banana
 */
async function generateFeaturedImage(options) {
  const { title, topics = [], postType = 'journal', slug, dryRun = false } = options;

  // Validate inputs
  if (!title) throw new Error('Title is required');
  if (!slug) throw new Error('Slug is required');

  // Build prompt
  const prompt = buildPrompt({ title, topics, postType });

  // Output filename
  const timestamp = Date.now();
  const filename = `featured-${slug}-${timestamp}.png`;
  const outputPath = path.join(IMAGES_PATH, filename);

  // Dry run mode - skip dependency check and generation
  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      prompt,
      outputPath: `/images/${filename}`,
      filename,
    };
  }

  // Check dependencies only when actually generating
  const deps = checkDependencies();
  if (!deps.available) {
    return {
      success: false,
      error: deps.error,
      suggestion:
        'Featured image generation is optional. The post can be created without an image.',
    };
  }

  // Ensure output directories exist
  if (!fs.existsSync(IMAGES_PATH)) {
    fs.mkdirSync(IMAGES_PATH, { recursive: true });
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate image using Gemini CLI with nanobanana
  const command = `gemini --yolo "/generate '${prompt.replace(/'/g, "\\'")}'"`;

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: JOURNAL_PATH,
      timeout: 120000, // 2 minute timeout
      env: { ...process.env },
    });

    // Find generated image in output directory
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

    if (files.length === 0) {
      return {
        success: false,
        error: 'No image generated. Check Gemini CLI output.',
        stdout,
        stderr,
      };
    }

    // Get most recent file
    const sortedFiles = files
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(OUTPUT_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    const generatedFile = sortedFiles[0].name;
    const sourcePath = path.join(OUTPUT_DIR, generatedFile);

    // Copy to static/images with proper naming
    fs.copyFileSync(sourcePath, outputPath);

    // Clean up nanobanana output
    fs.unlinkSync(sourcePath);

    return {
      success: true,
      filename,
      outputPath: `/images/${filename}`,
      fullPath: outputPath,
      prompt,
    };
  } catch (error) {
    return {
      success: false,
      error: `Image generation failed: ${error.message}`,
      prompt,
    };
  }
}

/**
 * Get frontmatter cover field for Hugo
 */
function getCoverFrontmatter(imagePath, title) {
  return {
    cover: {
      image: imagePath,
      alt: title,
      caption: '',
      relative: false,
    },
  };
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Featured Image Generator for Homelab Journal

Usage:
  node generate-featured-image.js [options]

Options:
  --title <text>       Post title (required)
  --topics <list>      Comma-separated topics
  --type <type>        Post type: journal/tutorial/lesson-learned/architecture
  --slug <text>        URL slug for the post (required)
  --json <json>        JSON input with all options
  --dry-run            Show prompt without generating
  --check              Check if dependencies are available
  --help, -h           Show this help

Examples:
  node generate-featured-image.js --title "Setting up Pi-hole HA" --topics "dns,pihole" --type tutorial --slug pihole-ha
  node generate-featured-image.js --check
`);
    process.exit(0);
  }

  // Check dependencies only
  if (args.includes('--check')) {
    const result = checkDependencies();
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.available ? 0 : 1);
  }

  // Parse arguments
  function getArg(name) {
    const idx = args.findIndex(a => a === `--${name}`);
    return idx !== -1 ? args[idx + 1] : null;
  }

  let options;

  // JSON input
  const jsonInput = getArg('json');
  if (jsonInput) {
    try {
      options = JSON.parse(jsonInput);
    } catch (e) {
      console.error(JSON.stringify({ success: false, error: 'Invalid JSON input' }));
      process.exit(1);
    }
  } else {
    options = {
      title: getArg('title'),
      topics: getArg('topics')?.split(',').map(t => t.trim()) || [],
      postType: getArg('type') || 'journal',
      slug: getArg('slug'),
      dryRun: args.includes('--dry-run'),
    };
  }

  // Validate required args
  if (!options.title || !options.slug) {
    console.error(JSON.stringify({ success: false, error: '--title and --slug are required' }));
    process.exit(1);
  }

  // Generate
  generateFeaturedImage(options)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(JSON.stringify({ success: false, error: error.message }));
      process.exit(1);
    });
}

module.exports = {
  generateFeaturedImage,
  buildPrompt,
  checkDependencies,
  getCoverFrontmatter,
  TOPIC_THEMES,
  TYPE_STYLES,
};
