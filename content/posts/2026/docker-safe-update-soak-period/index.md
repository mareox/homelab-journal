---
title: "Building a Safe Auto-Update System for Docker After a 2 AM Outage"
date: 2026-03-09
tags: ["lesson-learned", "tutorial"]
topics: ["docker", "automation", "containers", "updates", "semaphore", "infrastructure"]
difficulties: ["intermediate"]
description: "After a broken Docker image took down my CI/CD for 8 hours, I built a safe auto-update system with soak periods, test containers, and automatic rollback."
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

Every few seconds, the container hit the broken entrypoint, crashed, and started over.

<!-- SCREENSHOT: Terminal showing the crash loop — the repeating syntax error in docker logs output -->

## What Happened

A few weeks earlier, I'd [migrated from Watchtower to WUD]({{< relref "/posts/2026/watchtower-to-wud-migration" >}}) across my Docker services. For most of them, WUD only sent notifications.

But for Semaphore, I'd left one setting enabled:

```yaml
- WUD_TRIGGER_DOCKER_LOCAL_PRUNE=true
```

That setting lets WUD pull new images and recreate containers. At 2:01 AM, it saw a new version of `semaphoreui/semaphore:latest` (v2.16.51), pulled it, and replaced the running container without testing the image or checking its health.

The new image shipped with a broken Bash script in its entrypoint.

## The Immediate Fix

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
   curl http://<YOUR_SEMAPHORE_IP>:3000/api/ping
   # pong
   ```

Once I saw the crash loop, I got Semaphore back in under 5 minutes. By then, 8 hours had passed without scheduled Ansible jobs. That included certificate renewals, backup verification, and health checks.

<!-- SCREENSHOT: Before/after compose diff — showing the change from :latest to pinned version v2.16.50 -->

## The Real Problem

Pinning a version got Semaphore running again. I still needed a way to pick up security patches, bug fixes, and new features.

- **Apply updates immediately.** Patches arrive fast, along with broken releases.
- **Keep the pin forever.** The service stays on a known build, but I miss fixes and security patches.

## The Soak Period Pattern

I borrowed the staged rollout and soak period that large organizations use for software deployments.

When a new version appears:

1. Keep the current version running.
2. Wait N days to give other users time to report bugs.
3. Validate the new image before applying it.
4. Roll back if it fails validation after the swap.

Most broken Docker images get GitHub issues within 24 to 48 hours. If I'd waited 3 days before applying v2.16.51, I'd have given other users time to report the broken entrypoint and the maintainers time to fix or pull the release. Semaphore could have kept running on the old image.

I settled on **5 days**. A Monday release gets through Friday before I touch it, and security patches spend less than a week waiting for my first test.

## The Implementation

I wrote `safe-update.sh` to run every day at 4 AM from cron:

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

### Digest comparison, not tag comparison

```bash
CURRENT_DIGEST=$(docker inspect semaphore --format='{{index .Image}}')
docker pull semaphoreui/semaphore:latest --quiet
UPSTREAM_DIGEST=$(docker inspect semaphoreui/semaphore:latest --format='{{index .Id}}')
```

Maintainers can point `:latest` at a different image without changing the tag. A digest changes when the image content changes, so I can detect a new build even when the tag stays the same.

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

The v2.16.51 syntax error would have crashed the test container and failed the health check before the script touched production.

### Automatic rollback

If the test passes and the production container fails after the swap, the script rolls back. The production environment or volume mount may differ from the test:

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

<!-- SCREENSHOT: Terminal showing `cat .update-state/pending` with the marker file contents -->

The marker survives reboots. I can inspect it, delete it to reset the timer, or set the epoch to 0 to skip the soak:

```bash
echo "DETECTED_EPOCH=0" > .update-state/pending
```

<!-- SCREENSHOT: WUD dashboard showing monitored containers with available update indicators -->

## WUD: Notify Only

The compose change to prevent this from happening again:

```yaml
# Before: WUD auto-applies updates
- WUD_TRIGGER_DOCKER_LOCAL_PRUNE=true

# After: WUD only notifies via Discord
# - WUD_TRIGGER_DOCKER_LOCAL_PRUNE=true  # DISABLED
```

WUD still sends Discord notifications when it finds a new version. `safe-update.sh` runs on its own schedule and validates the image before applying it.

## Discord Notifications

The script sends Discord embeds at three stages:

- **New version detected**: "Semaphore v2.17.21 available. Will auto-update in 5 days (2026-03-14)."
- **Update applied**: "Safe update completed. Previous: v2.16.50, New: v2.17.21. Soak period: 5 days."
- **Rollback triggered**: "v2.17.21 failed health check. Rolled back to v2.16.50. Manual investigation recommended."

<!-- SCREENSHOT: Discord channel showing all 3 notification types — detected, updated, and rollback embeds -->

## Cron Setup

```bash
# Daily at 4:00 AM Pacific
0 4 * * * /root/semaphore/scripts/safe-update.sh >> /var/log/semaphore-update.log 2>&1
```

The log captures all output. Here's a successful run that had nothing to update:

```
[2026-03-09 04:00:05] Starting safe update check
[2026-03-09 04:00:05] Current version: v2.16.50
[2026-03-09 04:00:06] Upstream version: v2.17.21
[2026-03-09 04:00:06] Version v2.17.21 has been soaking for 3/5 days
[2026-03-09 04:00:06] Still soaking. 2 days remaining.
```

<!-- SCREENSHOT: Terminal showing safe-update.sh log output — either the soak countdown or a successful update completion -->

## Why Not Just Pin and Manually Update?

I considered this. Pin to a specific tag, get WUD notifications, and manually `docker compose pull && up -d` when I want to update.

The problem is me. I'll see the Discord notification, think "I'll update this weekend," and then forget for three months. The script does the waiting and testing I keep meaning to do.

## Could This Work for Other Services?

The same sequence applies to other services:

1. Pull the latest image
2. Compare digests
3. Soak for N days
4. Test with a health endpoint
5. Swap or rollback

For another Docker service, the main work is configuring its health check and getting the test container to boot:

- **Soak period**: 5 days for most services. Maybe 7 for databases or security-critical tools.
- **Health endpoint**: `/api/ping`, `/healthz`, `/health`, or just a TCP port check.
- **Test container config**: Needs enough environment to boot (DB connection, config files) but ideally read-only data mounts.

I'm planning to generalize this across my other Docker services. The ones running WUD with `wud.watch=true` are the obvious candidates.

## Key Takeaways

1. **An untested `:latest` can take down the service.** I now treat a new image as a candidate until it passes a test.

2. **Wait long enough for other users to hit the obvious bugs.** I use 5 days because critical issues often surface within 48 hours.

3. **Test the startup path.** A throwaway container costs me about 90 seconds. The broken entrypoint cost me 8 hours of automation.

4. **Put the waiting and testing on a schedule.** A notification alone still needs me to follow through.

5. **Give detection and deployment separate jobs.** WUD tells me what's available. The script decides whether it's ready.

The full script is [on GitHub](https://github.com/mareox/homelab-infra/blob/main/semaphore/scripts/safe-update.sh) if you want to adapt it for your own setup.
