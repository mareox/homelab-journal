---
title: "Repository Rename: homelab-infrastructure → homelab-infra"
date: 2026-01-25
tags: ["journal", "housekeeping"]
topics: ["git", "documentation"]
---

## What Changed

Renamed the main infrastructure repository from `homelab-infrastructure` to `homelab-infra` for brevity.

## Why

Shorter name is easier to type and fits better in paths, prompts, and documentation. The word "infrastructure" was unnecessarily long.

## Details

- Renamed on GitHub
- Updated local clone
- Updated all cross-references in:
  - CLAUDE.md files
  - n8n-workflows documentation
  - claude-config skill references
  - Portainer Git stack URLs

## Result

All references updated. Portainer stacks continue to deploy correctly from new repo URL.
