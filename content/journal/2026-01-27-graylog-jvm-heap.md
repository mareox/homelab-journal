---
title: "Graylog JVM Heap Optimization"
date: 2026-01-27
tags: ["journal", "performance"]
topics: ["graylog", "jvm", "docker"]
related: "/posts/2026/graylog-jvm-heap-tuning/"
---

## What Changed

Pinned Graylog's JVM heap to 1GB by adding explicit `GRAYLOG_SERVER_JAVA_OPTS` to docker-compose.yml:

```yaml
GRAYLOG_SERVER_JAVA_OPTS: "-Xms1g -Xmx1g -XX:NewRatio=1 -server -XX:+UseG1GC"
```

## Why

Noticed high memory usage on the Graylog VM. JVM ergonomics was auto-allocating ~2GB for Graylog, leaving insufficient RAM for OS filesystem cache. OpenSearch query performance suffers without cache headroom.

## Details

- **Service**: Graylog (Log-Server VM)
- **File changed**: `graylog/docker-compose.yml`
- **Deployed via**: Portainer Git stack (auto-pulls from repo)

Memory allocation now:
| Component | RAM |
|-----------|-----|
| OpenSearch | 1 GB |
| Graylog | 1 GB |
| OS + cache | ~2 GB |

## Result

~1GB freed for filesystem cache. OpenSearch can now cache index files in RAM, improving query response times.

**Detailed write-up**: [Lesson Learned: Graylog JVM Heap Over-Allocation]({{< relref "/posts/2026/graylog-jvm-heap-tuning" >}})
