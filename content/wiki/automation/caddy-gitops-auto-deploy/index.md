---
title: "Architecture: Caddy GitOps Auto-Deploy"
date: 2026-02-18
tags: ["architecture", "automation", "gitops"]
topics: ["caddy", "semaphore", "github-webhooks", "ha-proxy"]
description: &excerpt "How the lab validates and deploys Caddy config changes to both reverse proxy nodes."
summary: *excerpt
---

## Overview

I forgot to copy a Caddy site config to the second node and caused an outage. Then I did it again in the same week. Both Caddy nodes in the keepalived HA pair need the same configuration, so I set up a webhook to deploy to both on every push to the main branch. The pipeline validates both copies, rolls back on failure, and posts the result to Discord.

## Diagram

![Caddy GitOps auto-deploy pipeline with validation and rollback](gitops-pipeline.svg)

## Components

### GitHub Webhook
- Fires on every push to `main`
- Sends payload with commit SHA and ref
- Uses HMAC-SHA256 signature for authentication
- Delivers through Cloudflare Tunnel (no port forwarding needed)

### Semaphore Integration
- Validates webhook signature (prevents unauthorized triggers)
- Matches only `refs/heads/main` (ignores other branches)
- Extracts `commit_sha` from payload for audit trail
- Triggers the Ansible template automatically

### Ansible Playbook (`sync-caddy-sites.yml`)
The playbook checks both nodes before copying any files.

1. **Pre-flight**: Verify SSH access to both nodes, check file integrity (truncation guard rejects files < 100 bytes)
2. **Backup**: Timestamped backup of current configs on each node
3. **Deploy**: SCP all site files, snippets, and main Caddyfile to both nodes
4. **Validate**: Run `caddy validate` inside the container on both nodes
5. **Rollback** (on failure): Restore from backup, notify Discord, fail the task
6. **Reload**: Reload the backup first, then the master, to minimize HA disruption
7. **Verify**: Compare the deployed domain count with Git to catch drift immediately
8. **Cleanup**: Prune old backups (keep last 5 per node)

### Discord Notifications
- **Success**: Green embed with commit hash, domain count, files synced
- **Failure**: Red embed with failed nodes and rollback confirmation
- **Dry Run**: Yellow embed (validation only, no reload)

## Design Decisions

### Why Semaphore (not GitHub Actions)?
Semaphore runs inside the homelab network, with direct SSH access to both Caddy nodes. GitHub Actions would need a self-hosted runner or VPN tunnel to reach internal servers. Semaphore also manages all other homelab automation (power management, maintenance, updates), keeping everything in one place.

### Why sync ALL files every run (not just changed files)?
A full sync keeps both nodes aligned with Git without having to handle renames and moves in GitHub's changed-files list. It takes ~25 seconds for 4 site files, 1 snippet, and the Caddyfile.

### Why reload backup node first?
If the backup breaks on reload after passing validation, the master can keep serving traffic with the keepalived VIP.

### Why Cloudflare Tunnel for the webhook?
The Semaphore instance is behind NAT with no public IP. Cloudflare Tunnel provides a stable external endpoint (`sema.<YOUR_DOMAIN>`) that GitHub can reach, without opening firewall ports. The same tunnel already serves other homelab services.

### Why a truncation guard?
A previous outage was caused by deploying a truncated config file (incomplete SCP transfer). The playbook now rejects site files smaller than 100 bytes. In this setup, the expected files are at least that large.

## Trade-offs

| Decision | Benefit | Cost |
|----------|---------|------|
| Full sync (not diff-based) | Both nodes sync from Git | ~25s per run even for tiny changes |
| Webhook on all pushes to main | Simple setup | Triggers on non-Caddy changes too (playbook handles gracefully) |
| Rollback on ANY validation failure | Protects both nodes | Could rollback one node unnecessarily if only the other has issues |
| No approval gate | Instant deploys | Bad config deploys immediately (mitigated by validation + rollback) |

## What I Learned

I hit infinite template recursion twice in the same playbook, first with `commit_sha` and then with `dry_run`. Defining `dry_run: "{{ dry_run | default(false) }}"` in a `vars:` block causes the loop when the variable isn't passed. I removed the definition and used `| default(false)` wherever I read the variable.

**Semaphore webhook endpoints use random aliases, not numeric IDs.** The integration API creates an integration with a numeric ID, but the webhook receiver endpoint requires a separate alias object (`/api/integrations/<random_string>`). Without creating the alias, webhook deliveries return "no rows in result set."

**Cloudflare Tunnel public hostnames vs DNS records are different things.** A regular DNS A record points to your WAN IP. With no port forwarding, requests to that address never reach the service behind the tunnel. The service must be added as a "Public Hostname" in the Cloudflare Zero Trust tunnel configuration, which routes through the tunnel's encrypted connection.

## Results

- **Before**: Manual SCP to two nodes, prone to forgetting one. Multiple outages from config drift.
- **After**: Push to Git, both nodes update in ~25 seconds with validation and rollback safety.
- **Pipeline verified**: Two consecutive successful runs deploying real config changes through the full webhook chain.
