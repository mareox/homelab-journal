---
title: "Watchtower Discord Embed Notifications"
date: 2026-01-25
tags: ["journal", "notifications"]
topics: ["watchtower", "discord", "docker"]
---

## What Changed

Upgraded Watchtower notifications from plain text to Discord embeds using Shoutrrr URL parameters:
- Added colored sidebar (green for updates)
- Suppressed noisy startup messages
- Cleaner, more readable notifications

## Why

Plain text Watchtower notifications were hard to scan in busy Discord channels. Embeds provide visual structure and color-coding.

## Details

Updated `WATCHTOWER_NOTIFICATION_URL` across all Docker Compose stacks:

```yaml
environment:
  - WATCHTOWER_NO_STARTUP_MESSAGE=true
  - "WATCHTOWER_NOTIFICATION_URL=discord://<WEBHOOK_ID>/<WEBHOOK_TOKEN>?color=5793266&title=Watchtower:+ServiceName"
```

Key parameters:
- `color=5793266` - Green sidebar (hex `#588532` as decimal)
- `title=Watchtower:+ServiceName` - Clear source identification
- `WATCHTOWER_NO_STARTUP_MESSAGE=true` - Prevents "Watchtower started" spam

## Result

Discord notifications now show as clean embeds with green sidebar. Startup noise eliminated. Rolled out to all services with Watchtower.
