---
title: "Lesson Learned: Why I Replaced Watchtower with WUD Across My Homelab"
date: 2026-02-04
tags: ["lesson-learned", "docker", "automation"]
topics: ["containers", "updates", "infrastructure"]
---

## The Problem

Watchtower had been my go-to for automatic Docker container updates across 8+ services. It worked... mostly. But I kept running into issues:

1. **Opt-out model is dangerous** - Watchtower watches ALL containers by default. I had to remember to add `com.centurylinklabs.watchtower.enable=false` to containers I didn't want updated. Forgetting meant surprise updates.

2. **No visibility** - Updates happened silently at 4 AM. I only knew something updated when it broke. No dashboard, no easy way to see pending updates.

3. **Auto-apply anxiety** - For production services like my reverse proxy or secrets manager, I wanted to *know* about updates before they happened, not discover them after.

## What I Tried

Researched alternatives:
- **Diun** - Notification-only, but no web UI
- **Renovate** - Overkill for homelab (designed for CI/CD pipelines)
- **Ouroboros** - Abandoned project
- **WUD (What's Up Docker)** - Opt-in model, web dashboard, notification-only by default

## The Solution

Migrated all 8 Docker stacks from Watchtower to WUD:

```yaml
# WUD Golden Template
wud:
  image: fmartinou/whats-up-docker:latest
  container_name: wud-<service>
  restart: unless-stopped
  ports:
    - "3000:3000"  # Web dashboard
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - wud-data:/store
  environment:
    - TZ=America/Los_Angeles
    - WUD_WATCHER_LOCAL_WATCHBYDEFAULT=false  # CRITICAL: opt-in only
    - WUD_TRIGGER_DISCORD_1_URL=${DISCORD_WEBHOOK_URL:-}
    - WUD_TRIGGER_DISCORD_1_BOTUSERNAME=WUD-ServiceName
    - WUD_TRIGGER_DISCORD_1_SIMPLETITLE=Container Update Available
    - "WUD_TRIGGER_DISCORD_1_SIMPLEBODY=$${name} can be updated from $${local} to $${remote}"
  labels:
    - "wud.watch=true"
```

Key changes from Watchtower:
- Containers need `wud.watch=true` label to be monitored (opt-in)
- Web dashboard shows all monitored containers and pending updates
- Notifications only - I decide when to pull updates
- Tag filtering with `wud.tag.include` regex for semver-only updates

## Root Cause

The real issue wasn't Watchtower being bad - it's that **auto-updating production containers is risky**. I wanted:
- Visibility into what *can* be updated
- Control over *when* updates happen
- Notifications without automatic action

Watchtower's philosophy is "keep everything current automatically." WUD's philosophy is "show me what's available, I'll decide."

## Key Takeaways

1. **Opt-in beats opt-out for production** - Forgetting to exclude a container from updates is worse than forgetting to include one.

2. **`WUD_WATCHER_LOCAL_WATCHBYDEFAULT=false` is mandatory** - Without this, WUD watches everything like Watchtower.

3. **Port conflicts are common** - WUD uses port 3000, same as many apps. Use 3001 for WUD when needed.

4. **Clean up orphan containers** - After migration, old Watchtower containers stay around. Run `docker rm -f watchtower` on each host.

5. **Deploy to ALL HA nodes** - Config drift between HA pairs has caused outages before. Always deploy to both nodes simultaneously.

## Services Migrated

| Service | WUD Dashboard |
|---------|---------------|
| Caddy HA (2 nodes) | :3001 |
| Excalidraw | :3001 |
| Neko | :3000 |
| NetBox | :3000 |
| Pulse | :3000 |
| Semaphore | :3001 |
| Wazuh | :3000 |
| Infisical | :3001 |

Now I have 8 WUD dashboards showing me exactly what can be updated, and I apply updates on my schedule.
