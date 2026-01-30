#!/usr/bin/env bash
#
# Homelab Journal Content Sanitizer - Bash Wrapper
#
# Wrapper script for sanitize.js - replaces sensitive information
# with placeholders before publishing to public blog.
#
# Usage:
#   ./sanitize.sh input.md                    # Output to stdout
#   ./sanitize.sh input.md output.md          # Output to file
#   ./sanitize.sh --validate input.md         # Check if sanitized
#   cat content.md | ./sanitize.sh            # Pipe mode
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_SCRIPT="${SCRIPT_DIR}/sanitize.js"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed." >&2
    exit 1
fi

# Check if sanitize.js exists
if [[ ! -f "$NODE_SCRIPT" ]]; then
    echo "Error: sanitize.js not found at $NODE_SCRIPT" >&2
    exit 1
fi

# Pass all arguments to Node script
exec node "$NODE_SCRIPT" "$@"
