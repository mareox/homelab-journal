#!/usr/bin/env bash
# Validate that every tracked gitlink (mode 160000) has a matching .gitmodules entry.
# Prevents GitHub Actions checkout failures like:
#   fatal: No url found for submodule path '<path>' in .gitmodules

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

mapfile -t gitlinks < <(git ls-files -s | awk '$1 == "160000" {print $4}' | sort)

if [[ ${#gitlinks[@]} -eq 0 ]]; then
  echo "No tracked submodules/gitlinks found."
  exit 0
fi

if [[ ! -f .gitmodules ]]; then
  echo "ERROR: tracked gitlinks exist but .gitmodules is missing:" >&2
  printf '  - %s\n' "${gitlinks[@]}" >&2
  exit 1
fi

mapfile -t module_paths < <(git config --file .gitmodules --get-regexp '^submodule\..*\.path$' 2>/dev/null | awk '{print $2}' | sort || true)

missing=()
for path in "${gitlinks[@]}"; do
  found=false
  for module_path in "${module_paths[@]}"; do
    if [[ "$path" == "$module_path" ]]; then
      found=true
      break
    fi
  done

  if [[ "$found" == false ]]; then
    missing+=("$path")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "ERROR: tracked gitlink(s) missing from .gitmodules:" >&2
  printf '  - %s\n' "${missing[@]}" >&2
  echo >&2
  echo "Fix by either:" >&2
  echo "  1. Removing accidental gitlinks: git rm --cached <path>" >&2
  echo "  2. Or adding a valid submodule URL to .gitmodules." >&2
  exit 1
fi

echo "Submodule metadata OK (${#gitlinks[@]} gitlink(s) validated)."
