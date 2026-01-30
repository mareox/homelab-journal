#!/usr/bin/env node
/**
 * Content Sanitization Script for Homelab Journal
 *
 * Removes/replaces sensitive information from blog content:
 * - Private IP addresses → placeholders or role names
 * - Internal hostnames → generic role names
 * - Domains → <YOUR_DOMAIN>
 * - Credentials → flagged for manual review
 *
 * Usage:
 *   node sanitize.js < input.md > output.md
 *   node sanitize.js --file input.md --output output.md
 *
 * As module:
 *   const { sanitize, sanitizeWithReport } = require('./sanitize');
 *   const result = sanitize(content);
 */

// Hostname to role name mapping
const HOSTNAME_MAP = {
  // Proxmox Cluster
  'pve-mini2': 'Proxmox-Node-1',
  'pve-mini3': 'Proxmox-Node-2',
  'pve-mini4': 'Proxmox-Node-3',
  'pve-mini5': 'Proxmox-Node-4',
  'pve-mini6': 'Proxmox-Node-5',
  'pbs': 'Backup-Server',

  // DNS/Pi-hole
  'dns1': 'DNS-Primary',
  'dns2': 'DNS-Secondary',
  'pihole1': 'DNS-Primary',
  'pihole2': 'DNS-Secondary',
  'dns': 'DNS-VIP',
  'dns30': 'DNS-VLAN30',
  'dns40': 'DNS-VLAN40',
  'dns50': 'DNS-VLAN50',

  // Storage
  'nas920': 'NAS-Primary',
  'nas719': 'NAS-Secondary',
  'nas1': 'NAS-Primary',
  'nas2': 'NAS-Secondary',

  // Network
  'mx-fw': 'Firewall-Main',
  'mx-fw-mgmt': 'Firewall-Mgmt',
  'fw-mgmt': 'Firewall-Mgmt',
  'vm-fw1': 'Firewall-VM-1',
  'vm-fw2': 'Firewall-VM-2',
  'vm-fw30': 'Firewall-VM-30',
  'vm-fwha1': 'Firewall-HA-1',
  'vm-fwha2': 'Firewall-HA-2',
  'panorama': 'Panorama',
  'expedition': 'Expedition',

  // UniFi
  'ui': 'UniFi-Controller',
  'ui-sw': 'UniFi-Switch',
  'usw-24-g2': 'UniFi-Switch-24',
  'u6-lr': 'UniFi-AP-LR',
  'u6-up': 'UniFi-AP-Pro',
  'exp-lr': 'UniFi-Gateway',

  // Services
  'caddy': 'Reverse-Proxy',
  'caddy1': 'Reverse-Proxy-1',
  'caddy2': 'Reverse-Proxy-2',
  'n8n': 'Automation-Server',
  'semaphore': 'Ansible-Server',
  'graylog': 'Log-Server',
  'vaultwarden': 'Password-Manager',
  'myspeed': 'Speed-Monitor',
  'homarr': 'Dashboard',
  'portainer': 'Container-Manager',
  'dkr-main': 'Docker-Host-Main',
  'lxc-xsoar': 'XSOAR-Server',
};

// IP to role mapping (specific known IPs)
const IP_MAP = {
  // Proxmox
  '192.168.30.202': 'Proxmox-Node-1',
  '192.168.30.203': 'Proxmox-Node-2',
  '192.168.30.204': 'Proxmox-Node-3',
  '192.168.30.205': 'Proxmox-Node-4',
  '192.168.30.206': 'Proxmox-Node-5',
  '192.168.30.208': 'Backup-Server',

  // DNS
  '192.168.10.110': 'DNS-VIP',
  '192.168.10.111': 'DNS-Primary',
  '192.168.10.112': 'DNS-Secondary',
  '192.168.30.110': 'DNS-VLAN30',

  // NAS
  '192.168.10.100': 'NAS-Primary',
  '192.168.10.102': 'NAS-Secondary',

  // Firewall
  '192.168.10.1': 'Firewall-Main',
  '10.254.254.99': 'Firewall-Mgmt',

  // UniFi
  '192.168.30.140': 'UniFi-Controller',
  '192.168.30.250': 'UniFi-Switch',
  '192.168.30.251': 'UniFi-AP-LR',
  '192.168.30.252': 'UniFi-AP-Pro',
  '192.168.30.253': 'UniFi-Gateway',

  // Services (add more as needed)
  '192.168.30.220': 'Panorama',
  '192.168.30.126': 'Expedition',
  '192.168.30.128': 'XSOAR-Server',
};

// Domain patterns to sanitize
const DOMAIN_PATTERNS = [
  { pattern: /mareoxlan\.local/gi, replacement: '<YOUR_DOMAIN>' },
  { pattern: /mareoxlan\.com/gi, replacement: '<YOUR_PUBLIC_DOMAIN>' },
  { pattern: /mareoxlan\.synology\.me/gi, replacement: '<YOUR_SYNOLOGY_DOMAIN>' },
  { pattern: /mareoxlan2\.synology\.me/gi, replacement: '<YOUR_SYNOLOGY_DOMAIN_2>' },
  { pattern: /loc\.mareoxlan\.com/gi, replacement: '<YOUR_LOCAL_DOMAIN>' },
];

// Sensitive patterns to flag (not auto-replace)
const SENSITIVE_PATTERNS = [
  /password\s*[:=]\s*["']?[^"'\s]+["']?/gi,
  /api[_-]?key\s*[:=]\s*["']?[^"'\s]+["']?/gi,
  /token\s*[:=]\s*["']?[^"'\s]+["']?/gi,
  /secret\s*[:=]\s*["']?[^"'\s]+["']?/gi,
  /credential[s]?\s*[:=]\s*["']?[^"'\s]+["']?/gi,
  /bearer\s+[a-zA-Z0-9._-]+/gi,
  /authorization:\s*bearer\s+[a-zA-Z0-9._-]+/gi,
  /ssh-rsa\s+[A-Za-z0-9+/=]+/g,
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
];

// Username patterns
const USERNAME_PATTERNS = [
  { pattern: /\bmareox\b/gi, replacement: '<YOUR_USER>' },
  { pattern: /\broot@pam\b/gi, replacement: '<YOUR_ADMIN_USER>' },
];

/**
 * Sanitize content by replacing sensitive information
 * @param {string} content - The content to sanitize
 * @param {Object} options - Options for sanitization
 * @param {boolean} options.useRoleNames - Use role names instead of generic placeholders (default: true)
 * @param {boolean} options.preserveStructure - Keep IP format but anonymize (default: false)
 * @returns {string} Sanitized content
 */
function sanitize(content, options = {}) {
  const { useRoleNames = true, preserveStructure = false } = options;
  let result = content;

  // Step 1: Replace known IPs with role names
  if (useRoleNames) {
    for (const [ip, role] of Object.entries(IP_MAP)) {
      const ipRegex = new RegExp(ip.replace(/\./g, '\\.'), 'g');
      result = result.replace(ipRegex, role);
    }
  }

  // Step 2: Replace remaining private IPs with placeholders
  // Match 192.168.x.x, 10.x.x.x, 172.16-31.x.x
  if (preserveStructure) {
    result = result.replace(/\b192\.168\.\d{1,3}\.\d{1,3}\b/g, '192.168.X.X');
    result = result.replace(/\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '10.X.X.X');
    result = result.replace(/\b172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}\b/g, '172.X.X.X');
  } else {
    result = result.replace(/\b192\.168\.\d{1,3}\.\d{1,3}\b/g, '<YOUR_IP>');
    result = result.replace(/\b10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '<YOUR_IP>');
    result = result.replace(/\b172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}\b/g, '<YOUR_IP>');
  }

  // Step 3: Replace known hostnames with role names
  // Sort by length descending to match longer hostnames first (dns1 before dns)
  const sortedHostnames = Object.entries(HOSTNAME_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [hostname, role] of sortedHostnames) {
    // Match hostname with optional domain suffix
    // Only match lowercase hostnames (role names are Title-Case, so won't match)
    // This prevents 'dns' from matching 'DNS' in 'DNS-Primary'
    const hostnameRegex = new RegExp(
      `\\b${hostname}(?:\\.mareoxlan\\.(?:local|com))?\\b`,
      'g'  // Case-sensitive to avoid matching Title-Case role names
    );
    result = result.replace(hostnameRegex, role);
  }

  // Step 4: Replace domain patterns
  for (const { pattern, replacement } of DOMAIN_PATTERNS) {
    result = result.replace(pattern, replacement);
  }

  // Step 5: Replace usernames
  for (const { pattern, replacement } of USERNAME_PATTERNS) {
    result = result.replace(pattern, replacement);
  }

  // Step 6: Clean up any remaining .mareoxlan patterns
  result = result.replace(/\.mareoxlan\./gi, '.<YOUR_DOMAIN>.');

  return result;
}

/**
 * Sanitize content and return a report of what was flagged
 * @param {string} content - The content to sanitize
 * @param {Object} options - Options for sanitization
 * @returns {Object} { sanitized: string, warnings: string[], stats: Object }
 */
function sanitizeWithReport(content, options = {}) {
  const warnings = [];
  const stats = {
    ipsReplaced: 0,
    hostnamesReplaced: 0,
    domainsReplaced: 0,
    sensitiveFlagged: 0,
  };

  // Count IPs before sanitization
  const ipMatches = content.match(/\b(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\.\d{1,3}\.\d{1,3}\b/g);
  stats.ipsReplaced = ipMatches ? ipMatches.length : 0;

  // Count hostnames
  let hostnameCount = 0;
  for (const hostname of Object.keys(HOSTNAME_MAP)) {
    const regex = new RegExp(`\\b${hostname}\\b`, 'gi');
    const matches = content.match(regex);
    if (matches) hostnameCount += matches.length;
  }
  stats.hostnamesReplaced = hostnameCount;

  // Check for sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      stats.sensitiveFlagged += matches.length;
      matches.forEach(match => {
        // Truncate for display
        const truncated = match.length > 50 ? match.substring(0, 47) + '...' : match;
        warnings.push(`SENSITIVE: Found potential credential: "${truncated}"`);
      });
    }
  }

  // Perform sanitization
  const sanitized = sanitize(content, options);

  // Check if any private IPs remain (shouldn't happen, but safety check)
  const remainingIPs = sanitized.match(/\b(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\.\d{1,3}\.\d{1,3}\b/g);
  if (remainingIPs) {
    remainingIPs.forEach(ip => {
      warnings.push(`WARNING: Private IP may have been missed: ${ip}`);
    });
  }

  return { sanitized, warnings, stats };
}

/**
 * Validate that content is properly sanitized
 * @param {string} content - The content to validate
 * @returns {Object} { isValid: boolean, issues: string[] }
 */
function validate(content) {
  const issues = [];

  // Check for private IPs
  const ipMatches = content.match(/\b(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\.\d{1,3}\.\d{1,3}\b/g);
  if (ipMatches) {
    issues.push(`Found ${ipMatches.length} private IP(s): ${ipMatches.slice(0, 3).join(', ')}${ipMatches.length > 3 ? '...' : ''}`);
  }

  // Check for known hostnames
  for (const hostname of Object.keys(HOSTNAME_MAP)) {
    const regex = new RegExp(`\\b${hostname}(?:\\.mareoxlan)?\\b`, 'gi');
    if (regex.test(content)) {
      issues.push(`Found unsanitized hostname: ${hostname}`);
    }
  }

  // Check for domain
  if (/mareoxlan/i.test(content)) {
    issues.push('Found "mareoxlan" domain reference');
  }

  // Check for sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(content)) {
      issues.push('Found potential credential or secret');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Homelab Journal Content Sanitizer

Usage:
  node sanitize.js [options] < input.md > output.md
  cat input.md | node sanitize.js
  node sanitize.js --file input.md --output output.md
  node sanitize.js --validate input.md

Options:
  --file, -f <path>      Input file path
  --output, -o <path>    Output file path (default: stdout)
  --validate, -v <path>  Validate file without sanitizing
  --report, -r           Show sanitization report
  --preserve-structure   Keep IP format but anonymize (192.168.X.X)
  --no-role-names        Use <YOUR_IP> instead of role names
  --help, -h             Show this help
`);
    process.exit(0);
  }

  const fs = require('fs');

  // Parse arguments
  const fileIdx = args.findIndex(a => a === '--file' || a === '-f');
  const outputIdx = args.findIndex(a => a === '--output' || a === '-o');
  const validateIdx = args.findIndex(a => a === '--validate' || a === '-v');
  const showReport = args.includes('--report') || args.includes('-r');
  const preserveStructure = args.includes('--preserve-structure');
  const noRoleNames = args.includes('--no-role-names');

  const options = {
    useRoleNames: !noRoleNames,
    preserveStructure,
  };

  // Validate mode
  if (validateIdx !== -1) {
    const filePath = args[validateIdx + 1];
    if (!filePath || !fs.existsSync(filePath)) {
      console.error('Error: File not found for validation');
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const result = validate(content);

    if (result.isValid) {
      console.log('Content is properly sanitized.');
      process.exit(0);
    } else {
      console.log('Validation failed:');
      result.issues.forEach(issue => console.log(`  - ${issue}`));
      process.exit(1);
    }
  }

  // Sanitize mode
  let content;

  if (fileIdx !== -1 && args[fileIdx + 1]) {
    const filePath = args[fileIdx + 1];
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }
    content = fs.readFileSync(filePath, 'utf8');
  } else if (!process.stdin.isTTY) {
    // Read from stdin
    content = fs.readFileSync(0, 'utf8');
  } else {
    console.error('Error: No input provided. Use --file or pipe content.');
    process.exit(1);
  }

  // Process
  if (showReport) {
    const result = sanitizeWithReport(content, options);

    // Output to file or stdout
    if (outputIdx !== -1 && args[outputIdx + 1]) {
      fs.writeFileSync(args[outputIdx + 1], result.sanitized);
    } else {
      process.stdout.write(result.sanitized);
    }

    // Print report to stderr
    console.error('\n--- Sanitization Report ---');
    console.error(`IPs replaced: ${result.stats.ipsReplaced}`);
    console.error(`Hostnames replaced: ${result.stats.hostnamesReplaced}`);
    console.error(`Sensitive items flagged: ${result.stats.sensitiveFlagged}`);
    if (result.warnings.length > 0) {
      console.error('\nWarnings:');
      result.warnings.forEach(w => console.error(`  ${w}`));
    }
  } else {
    const sanitized = sanitize(content, options);

    if (outputIdx !== -1 && args[outputIdx + 1]) {
      fs.writeFileSync(args[outputIdx + 1], sanitized);
    } else {
      process.stdout.write(sanitized);
    }
  }
}

// Export for use as module
module.exports = {
  sanitize,
  sanitizeWithReport,
  validate,
  HOSTNAME_MAP,
  IP_MAP,
  DOMAIN_PATTERNS,
  SENSITIVE_PATTERNS,
};
