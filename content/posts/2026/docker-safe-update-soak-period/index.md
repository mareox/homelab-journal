---
title: "Building a Safe Auto-Update System for Docker After a 2 AM Outage"
date: 2026-03-09
tags: ["lesson-learned", "tutorial"]
topics: ["docker", "automation", "containers", "updates", "semaphore", "infrastructure"]
difficulties: ["intermediate"]
cover:
  image: "thumbnail.png"
---

## The 2 AM Wake-Up Call

I woke up to find my CI/CD platform had been down for 8 hours. Semaphore, the Ansible automation engine that manages my entire homelab, was stuck in a crash loop:

```
/usr/local/bin/server-wrapper: line 295: syntax error: unexpected "&&"
/usr/local/bin/server-wrapper: line 295: syntax error: unexpected "&&"
/usr/local/bin/server-wrapper: line 295: syntax error: unexpected "&&"
```

The same error, repeating every few seconds. The container would start, hit the broken entrypoint script, crash, and restart. Endlessly.

## What Happened

A few weeks ago, I [migrated from Watchtower to WUD](/posts/2026/watchtower-to-wud-migration/) across all my Docker services. WUD's whole pitch is "notify, don't auto-update." And for most of my services, that's exactly how I configured it.

But for Semaphore, I'd left one setting enabled:

```yaml
- WUD_TRIGGER_DOCKER_LOCAL_PRUNE=true
```

This tells WUD to not just *detect* new images, but to **pull and recreate containers automatically**. At 2:01 AM, WUD spotted that `semaphoreui/semaphore:latest` had a new version (v2.16.51), pulled it, and swapped the running container. No health check. No validation. Just blind trust that upstream published a working image.

They didn't. The new image shipped with a broken bash script in its entrypoint.

## The Immediate Fix

The fix was straightforward:

1. Pin the image to the last known-good version:
   ```yaml
   image: semaphoreui/semaphore:v2.16.50  # was :latest
   ```

2. Push the updated compose file and redeploy:
   ```bash
   docker compose pull semaphore && docker compose up -d semaphore
   ```

3. Verify:
   ```bash
   curl http://192.168.30.66:3000/api/ping
   # pong
   ```

Service restored in under 5 minutes once I was actually looking at it. But the 8 hours of silent downtime before that? All my scheduled Ansible tasks - certificate renewals, backup verification, health checks - none of them ran.

## The Real Problem

Pinning to a specific version solves today's problem but creates tomorrow's: you never get updates at all. I need updates - security patches, bug fixes, new features. I just need them to not break things.

The core tension is:
- **Auto-update immediately**: Fast patches, but broken releases take you down (what happened)
- **Never auto-update**: Maximum stability, but you accumulate security debt and miss fixes
- **Something in between**: ?

## The Soak Period Pattern

The answer is borrowed from how large organizations handle software rollouts: **staged deployment with a soak period**.

The idea is simple. When a new version appears:

1. Don't apply it immediately
2. Wait N days for the community to discover bugs
3. Then validate it yourself before applying
4. If validation fails, roll back automatically

Most broken Docker images get GitHub issues filed within 24-48 hours. If I'd waited even 3 days before applying v2.16.51, someone else would have discovered the broken entrypoint script, the maintainers would have either fixed it or yanked the release, and my Semaphore would have kept running.

I settled on **5 days** as the soak period. It covers a full work week (a Monday release gets community-vetted through Friday), and it's short enough that security patches don't sit unapplied for too long.

## The Implementation

I wrote a bash script (`safe-update.sh`) that runs daily via cron at 4 AM. Here's the flow:

{{< mermaid >}}
flowchart TD
    A[Daily cron - 4 AM] --> B[Pull latest image]
    B --> C{New version?}
    C -->|No| D[Exit - nothing to do]
    C -->|Yes| E{Pending marker exists?}
    E -->|No| F[Create marker with today's date]
    F --> G[Discord: New version detected]
    G --> D
    E -->|Yes| H{5+ days old?}
    H -->|No| D
    H -->|Yes| I[Start test container on port 3333]
    I --> J{Health check /api/ping?}
    J -->|Fail| K[Discord: Failed validation]
    K --> D
    J -->|Pass| L[Update compose file tag]
    L --> M[Recreate production container]
    M --> N{Production health check?}
    N -->|Pass| O[Discord: Updated successfully]
    N -->|Fail| P[Rollback to previous version]
    P --> Q[Discord: Rolled back]
{{< /mermaid >}}

The key design decisions:

### Digest comparison, not tag comparison

```bash
CURRENT_DIGEST=$(docker inspect semaphore --format='{{index .Image}}')
docker pull semaphoreui/semaphore:latest --quiet
UPSTREAM_DIGEST=$(docker inspect semaphoreui/semaphore:latest --format='{{index .Id}}')
```

Tags can be moved (`:latest` points to whatever's newest). Image digests are content-addressed hashes - if the binary content changes, the digest changes. This catches every update, even if the maintainer re-tags an existing version.

### Test container before production swap

Before touching the running service, the script spins up a throwaway container with a read-only mount of the data directory:

```bash
docker run -d \
    --name semaphore-test \
    -v ./data:/var/lib/semaphore:ro \
    -p 3333:3000 \
    semaphoreui/semaphore:latest
```

Then hits the health endpoint with a 90-second timeout:

```bash
while [ "$elapsed" -lt 90 ]; do
    if curl -sf http://localhost:3333/api/ping >/dev/null 2>&1; then
        return 0
    fi
    sleep 5
    elapsed=$((elapsed + 5))
done
```

If v2.16.51 had gone through this, the syntax error would have crashed the test container, the health check would have failed, and production would have been left untouched. Exactly what we want.

### Automatic rollback

If the test passes but production somehow fails after the swap (different environment, volume mount issues, etc.), the script rolls back:

```bash
# Restore previous version in compose
sed -i "s|image: semaphoreui/semaphore:.*|image: semaphoreui/semaphore:${ROLLBACK_VERSION}|" \
    docker-compose.yml

docker compose up -d semaphore
```

### State management with a marker file

The soak period is tracked with a simple file:

```
/root/semaphore/scripts/.update-state/pending
```

Contents:
```
DETECTED_DATE=2026-03-09
DETECTED_EPOCH=1741510800
UPSTREAM_VERSION=v2.17.21
FROM_VERSION=v2.16.50
```

This survives reboots, is easy to inspect, and can be manually deleted to reset the timer. To force an immediate update (skip the soak), just set the epoch to 0:

```bash
echo "DETECTED_EPOCH=0" > .update-state/pending
```

## WUD: Notify Only

The compose change to prevent this from happening again:

```yaml
# Before: WUD auto-applies updates
- WUD_TRIGGER_DOCKER_LOCAL_PRUNE=true

# After: WUD only notifies via Discord
# - WUD_TRIGGER_DOCKER_LOCAL_PRUNE=true  # DISABLED
```

WUD still monitors the container and sends Discord notifications when new versions are available. But the actual update is handled by `safe-update.sh` on its own schedule, with validation.

## Discord Notifications

The script sends Discord embeds at three stages:

- **New version detected**: "Semaphore v2.17.21 available. Will auto-update in 5 days (2026-03-14)."
- **Update applied**: "Safe update completed. Previous: v2.16.50, New: v2.17.21. Soak period: 5 days."
- **Rollback triggered**: "v2.17.21 failed health check. Rolled back to v2.16.50. Manual investigation recommended."

This gives me full visibility without requiring me to check logs.

## Cron Setup

```bash
# Daily at 4:00 AM Pacific
0 4 * * * /root/semaphore/scripts/safe-update.sh >> /var/log/semaphore-update.log 2>&1
```

The log file captures all output for debugging. A typical successful no-op looks like:

```
[2026-03-09 04:00:05] Starting safe update check
[2026-03-09 04:00:05] Current version: v2.16.50
[2026-03-09 04:00:06] Upstream version: v2.17.21
[2026-03-09 04:00:06] Version v2.17.21 has been soaking for 3/5 days
[2026-03-09 04:00:06] Still soaking. 2 days remaining.
```

## Why Not Just Pin and Manually Update?

I considered this. Pin to a specific tag, get WUD notifications, and manually `docker compose pull && up -d` when I want to update.

The problem is me. I'll see the Discord notification, think "I'll update this weekend," and then forget for three months. The safe-update script automates the disciplined approach I aspire to but don't consistently execute.

## Could This Work for Other Services?

Absolutely. The pattern is generic:

1. Pull the latest image
2. Compare digests
3. Soak for N days
4. Test with a health endpoint
5. Swap or rollback

Any Docker service with a health check endpoint could use the same script with minimal changes. The main variables are:

- **Soak period**: 5 days for most services. Maybe 7 for databases or security-critical tools.
- **Health endpoint**: `/api/ping`, `/healthz`, `/health`, or just a TCP port check.
- **Test container config**: Needs enough environment to boot (DB connection, config files) but ideally read-only data mounts.

I'm planning to generalize this across my other Docker services. The ones running WUD with `wud.watch=true` are the obvious candidates.

## Key Takeaways

1. **`:latest` + auto-update = eventual outage.** It's not a question of if, but when. Upstream will ship a broken release.

2. **5-day soak periods catch most community-discovered bugs.** Critical issues surface within 48 hours. Five days gives comfortable margin.

3. **Test containers are cheap insurance.** Spinning up a throwaway container for 90 seconds costs almost nothing. Not doing it cost me 8 hours of automation downtime.

4. **Automate the discipline you can't maintain manually.** I know I should wait before applying updates. I know I should test before deploying. The script does what I intend but don't always remember to do.

5. **WUD's notify-only mode is the correct default.** Detection and notification are separate concerns from application. Let WUD tell you what's available. Let something smarter decide when to apply it.

The full script is [on GitHub](https://github.com/mareox/homelab-infra/blob/main/semaphore/scripts/safe-update.sh) if you want to adapt it for your own setup.
