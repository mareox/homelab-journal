---
title: "Graylog JVM Heap Optimization"
date: 2026-01-27
tags: ["journal", "performance"]
topics: ["graylog", "jvm", "docker"]
related: "/posts/2026/graylog-jvm-heap-tuning/"
description: "Pinning Graylog's JVM heap to 1 GB freed about 1 GB for the filesystem cache OpenSearch uses."
---

## What Changed

Graylog's JVM was taking about 2 GB on the logging VM, leaving too little RAM for the filesystem cache OpenSearch relies on. I pinned Graylog's heap to 1 GB in `graylog/docker-compose.yml`:

```yaml
GRAYLOG_SERVER_JAVA_OPTS: "-Xms1g -Xmx1g -XX:NewRatio=1 -server -XX:+UseG1GC"
```

## Details

I deployed the change through the Portainer Git stack, which pulls from the repository automatically. Here's how the RAM was allocated afterward:

| Component | RAM |
|-----------|-----|
| OpenSearch | 1 GB |
| Graylog | 1 GB |
| OS + cache | ~2 GB |

## Result

The change freed about 1 GB for the filesystem cache. OpenSearch could keep more index data in RAM, which improved query response times.

[Lesson Learned: Graylog JVM Heap Over-Allocation]({{< relref "/posts/2026/graylog-jvm-heap-tuning" >}})
