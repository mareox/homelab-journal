---
title: "Watchtower Discord Embed Notifications"
date: 2026-01-25
tags: ["journal", "notifications"]
topics: ["watchtower", "discord", "docker"]
description: &excerpt "I switched Watchtower to Discord embeds so I could spot updates and see which service sent them."
summary: *excerpt
---

## What Changed

Plain-text Watchtower alerts were easy to miss in a busy Discord channel. I switched them to embeds with a colored sidebar for updates and turned off startup notifications.

## Details

I updated `WATCHTOWER_NOTIFICATION_URL` across the Docker Compose stacks that run Watchtower:

```yaml
environment:
  - WATCHTOWER_NO_STARTUP_MESSAGE=true
  - "WATCHTOWER_NOTIFICATION_URL=discord://<WEBHOOK_ID>/<WEBHOOK_TOKEN>?color=5793266&title=Watchtower:+ServiceName"
```

The `color=5793266` setting gives the sidebar the color `#5865F2`. The `title=Watchtower:+ServiceName` setting shows which service sent the alert. With `WATCHTOWER_NO_STARTUP_MESSAGE=true`, restarts no longer send a "Watchtower started" message.

## Result

The change is in every service that runs Watchtower. I can spot updates by the colored sidebar and see which service sent each one.
