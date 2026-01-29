---
title: "Automation"
description: "n8n workflows, Semaphore CI/CD, scripts, and infrastructure as code"
tags: ["wiki"]
topics: ["automation", "n8n", "ansible", "cicd", "scripts"]
---

Automation is the backbone of my homelab. This wiki covers the tools, patterns, and workflows that keep 50+ services running with minimal manual intervention.

## Automation Stack

{{< mermaid >}}
graph TB
    subgraph "Orchestration Layer"
        N8N[n8n<br/>Event-Driven Workflows]
        SEMA[Semaphore<br/>Ansible CI/CD]
    end

    subgraph "Execution Layer"
        ANSIBLE[Ansible Playbooks]
        SCRIPTS[Bash/Python Scripts]
        API[REST APIs]
    end

    subgraph "Triggers"
        WEBHOOK[Webhooks]
        CRON[Scheduled Jobs]
        DISCORD[Discord Bot]
        GIT[Git Push]
    end

    WEBHOOK & CRON & DISCORD --> N8N
    GIT & CRON --> SEMA
    N8N --> API & SCRIPTS
    SEMA --> ANSIBLE
    ANSIBLE --> SCRIPTS
{{< /mermaid >}}

## n8n Workflow Automation

[n8n](https://n8n.io) is my primary workflow automation platform—think Zapier/Make but self-hosted with full code access.

### Active Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Proxmox Monitor** | Webhook (Discord bot) | AI-assisted cluster management |
| **UniFi Reports** | Schedule (weekly) | Network device inventory reports |
| **Meeting Notes** | Webhook | Transcription and summarization |
| **Service Alerts** | Webhook | Route alerts to appropriate channels |

### n8n Architecture

```
┌─────────────────────────────────────────┐
│              n8n Server                  │
│  ┌─────────────────────────────────┐    │
│  │  Workflow Engine                 │    │
│  │  ├── Webhook Triggers            │    │
│  │  ├── Scheduled Triggers          │    │
│  │  └── Manual Triggers             │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  Credentials Store               │    │
│  │  (Encrypted at rest)             │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│          External Services              │
│  Discord • Proxmox API • GitHub         │
│  OpenAI • Graylog • Custom APIs         │
└─────────────────────────────────────────┘
```

### Workflow Patterns

**1. Event → Process → Notify**
```
Trigger (webhook/schedule)
    ↓
Process data (HTTP requests, code nodes)
    ↓
Notify (Discord, email, webhook)
```

**2. Fan-Out/Fan-In**
```
Single trigger
    ↓
Split to parallel branches
    ↓
Process independently
    ↓
Merge results
    ↓
Final action
```

**3. Error Handling**
```
Main workflow
    ↓
Try node
    ├── Success → Continue
    └── Error → Error workflow → Discord alert
```

### Discord Bot Integration

A Discord bot forwards DMs and @mentions to n8n webhooks, enabling conversational automation:

```
Discord @mention
    ↓
Discord Bot (LXC container)
    ↓
n8n Webhook
    ↓
AI Processing (Claude API)
    ↓
Response → Discord
```

**Use cases:**
- "Check Proxmox cluster status"
- "List running VMs on node 3"
- "Show recent Graylog alerts"

## Semaphore CI/CD

[Semaphore](https://github.com/semaphoreui/semaphore) is my Ansible automation platform—a web UI for running playbooks with scheduling and audit logging.

### Active Playbooks

| Category | Playbooks | Purpose |
|----------|-----------|---------|
| **Caddy Management** | add-domain, remove-domain, list-domains | Reverse proxy automation |
| **Power Management** | night-sleep, day-on | Proxmox cluster power scheduling |
| **Maintenance** | update-containers, backup-verify | Routine maintenance tasks |

### Caddy Domain Automation

Instead of SSH'ing to both Caddy nodes manually, Semaphore playbooks handle domain management:

**Add Domain:**
1. Input: domain name, backend IP, port
2. Playbook generates Caddy config snippet
3. Deploys to BOTH nodes (prevents config drift)
4. Validates with `caddy validate`
5. Reloads Caddy

**Remove Domain:**
1. Input: domain name
2. Playbook removes from both nodes
3. Validates and reloads

**List Domains:**
```
┌─────────────────────────────────────────┐
│  Configured Domains                      │
├─────────────────────────────────────────┤
│  service1.loc.domain.com → 192.168.x.x  │
│  service2.loc.domain.com → 192.168.x.x  │
│  ...                                     │
└─────────────────────────────────────────┘
```

### Power Management Automation

Scheduled playbooks manage Proxmox cluster power:

| Schedule | Playbook | Action |
|----------|----------|--------|
| 11 PM | night-sleep | Shutdown non-essential VMs/LXCs |
| 7 AM | day-on | Wake up daytime services |

**Why automate power?**
- Reduce electricity costs
- Extend hardware lifespan
- Lower heat output
- Essential services (DNS, proxy, backups) stay running 24/7

**Important gotcha:** Semaphore's cron scheduler ignores the container's `TZ` variable. Must set `SEMAPHORE_SCHEDULE_TIMEZONE` explicitly.

## Scripting Standards

### Bash Scripts

All bash scripts follow these conventions:

```bash
#!/usr/bin/env bash
set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Trap for cleanup
trap 'echo "Error on line $LINENO"; exit 1' ERR
```

**Validation:**
- `shellcheck` for linting
- `shfmt` for formatting
- Tested on both Ubuntu and Debian

### Python Scripts

For complex automation, Python with type hints:

```python
#!/usr/bin/env python3
"""Script description."""

from pathlib import Path
import argparse
import logging

def main() -> int:
    """Entry point."""
    ...
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
```

**Tooling:**
- `ruff` for linting
- `mypy` for type checking
- `uv` for fast package management

## Backup Automation

Standardized backup pattern across services:

```
┌──────────────┐
│ Backup Script │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Lock File    │ ← Prevent concurrent runs
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Create       │
│ Archive      │ → tar.gz with timestamp
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Copy to NFS  │ → /backups/BK_<service>/
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Retention    │ ← Delete old backups
│ Cleanup      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Verify       │ ← tar -tzf validation
│ Archive      │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Discord          │
│ Notification     │ ← Embed with status, size, count
└──────────────────┘
```

**Services with automated backups:**
- Vaultwarden (password manager)
- n8n workflows
- Graylog configuration
- Pi-hole settings

## Infrastructure as Code

### Git-Based Deployment

All configurations live in Git repositories:

```
homelab-infra/
├── caddy/           # Reverse proxy configs
├── graylog/         # Docker Compose + dashboards
├── pihole/          # HA DNS configs
├── proxmox/         # Cluster automation
└── semaphore/       # Ansible playbooks
```

**Deployment flow:**
1. Edit config locally
2. Commit and push
3. Portainer/Semaphore pulls changes
4. Service reloads

### Portainer GitOps

Docker Compose stacks deploy via Portainer's Git integration:

```
GitHub Repository
       │
       ▼
Portainer Stack
       │
       ▼
Docker Compose
       │
       ▼
Running Containers
```

**Update process:**
1. Push to main branch
2. Portainer detects change (webhook or poll)
3. Stack redeployed automatically

## Watchtower Auto-Updates

All Docker services include Watchtower for automated updates:

```yaml
watchtower:
  image: containrrr/watchtower:latest
  environment:
    - WATCHTOWER_CLEANUP=true
    - WATCHTOWER_TIMEOUT=300s
    - WATCHTOWER_ROLLING_RESTART=true
    - WATCHTOWER_SCHEDULE=0 0 4 */2 * *  # Every 2 days at 4 AM
```

**Key settings:**
- `CLEANUP=true`: Remove old images (save disk space)
- `ROLLING_RESTART=true`: Update one at a time (safer)
- `TIMEOUT=300s`: Allow 5 minutes for slow pulls
- Discord notifications on updates

## Notification Patterns

### Discord Webhook Embeds

All automation sends Discord notifications with consistent formatting:

```
┌─────────────────────────────────────┐
│ 🟢 Service Name                      │ ← Color-coded status
├─────────────────────────────────────┤
│ Status: Success                      │
│ Duration: 12s                        │
│ Details: ...                         │
├─────────────────────────────────────┤
│ Timestamp                            │
└─────────────────────────────────────┘
```

**Color coding:**
- 🟢 Green: Success
- 🟡 Yellow: Warning
- 🔴 Red: Error/Fault

### Shoutrrr Integration

Watchtower and other services use Shoutrrr for notifications:

```
discord://<webhook_id>/<webhook_token>?color=5793266&title=ServiceName
```

## Lessons Learned

### 1. Idempotency is Non-Negotiable

Every script must be safe to run multiple times:
- Check before creating (`id -u user` before `useradd`)
- Use `--ignore-existing` flags where available
- Test with `set -e` to catch hidden failures

### 2. Timezone Chaos

Different tools handle timezones differently:
- Docker: Uses host timezone or `TZ` env var
- Cron: Uses container timezone
- Semaphore: Has its OWN `SEMAPHORE_SCHEDULE_TIMEZONE`

Always set timezone explicitly. Default: `America/Los_Angeles`.

### 3. Lock Files Prevent Disasters

Long-running scripts need lock files:

```bash
LOCK_FILE="/var/lock/backup.lock"
exec 9>"$LOCK_FILE"
flock -n 9 || { echo "Already running"; exit 1; }
```

Without this, cron overlap caused corrupted backups.

### 4. Validate Before Deploy

Every deployment includes validation:
- `docker compose config --quiet` before deploy
- `caddy validate` before reload
- `bash -n script.sh` before execution

## Related Pages

- [Virtualization](/wiki/virtualization/) - Where automation runs
- [Monitoring](/wiki/monitoring/) - Automation observability
- [Networking](/wiki/networking/) - Caddy and DNS automation
