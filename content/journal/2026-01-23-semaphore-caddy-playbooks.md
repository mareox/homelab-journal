---
title: "Semaphore Caddy Domain Management Playbooks"
date: 2026-01-23
tags: ["journal", "automation"]
topics: ["semaphore", "caddy", "ansible", "reverse-proxy"]
---

## What Changed

Added three Ansible playbooks to Semaphore for managing Caddy reverse proxy domains:
- **Add Domain**: Creates new reverse proxy entry on both HA nodes
- **Remove Domain**: Removes domain from both nodes
- **List Domains**: Shows all configured domains across the cluster

## Why

Manual Caddy config edits were error-prone and required SSH to both nodes. Semaphore templates provide a UI for common operations with built-in validation.

## Details

- **Service**: Semaphore → Caddy HA pair
- **Playbooks**: `caddy-add-domain.yml`, `caddy-remove-domain.yml`, `caddy-list-domains.yml`
- **Template Variables**: Domain name, backend IP/port, TLS settings
- **Validation**: Runs `caddy validate` before applying changes

Key feature: Deploys to BOTH Caddy nodes automatically, preventing config drift that caused previous outages.

## Result

Domain management now takes 30 seconds via Semaphore UI instead of 5+ minutes of manual SSH and editing. Config drift risk eliminated.
