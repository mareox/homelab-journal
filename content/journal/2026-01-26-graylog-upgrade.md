---
title: "Graylog Upgrade to 7.0.3 + MongoDB 7.0"
date: 2026-01-26
tags: ["journal", "upgrade"]
topics: ["graylog", "mongodb", "docker"]
---

## What Changed

Upgraded the Graylog logging stack:
- Graylog: 6.x → **7.0.3**
- MongoDB: 6.x → **7.0**

## Why

Graylog 7 brings improved dashboard performance, better pipeline rule debugging, and updated API. MongoDB 7.0 is the new LTS release with better aggregation performance.

## Details

- **Service**: Graylog (Log-Server VM)
- **Method**: Updated version tags in docker-compose.yml, deployed via Portainer
- **Downtime**: ~5 minutes during container recreation

Key changes in Graylog 7:
- Dashboard API now requires entity wrappers
- Pipeline regex uses 0-based capture group indexing
- Stream creation requires explicit `index_set_id`

## Result

Upgrade successful. All 5 pipelines and 13 dashboards functioning. Had to update dashboard creation scripts to handle new API format.
