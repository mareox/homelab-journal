---
title: "Graylog Upgrade to 7.0.3 + MongoDB 7.0"
date: 2026-01-26
tags: ["journal", "upgrade"]
topics: ["graylog", "mongodb", "docker"]
description: &excerpt "I upgraded Graylog to 7.0.3 and MongoDB to 7.0, then fixed the dashboard scripts for the changed API."
summary: *excerpt
---

## What Changed

I upgraded Graylog from 6.x to **7.0.3** and MongoDB from 6.x to **7.0**. Graylog 7 improves dashboard performance and pipeline debugging and changes parts of the API. MongoDB 7.0 was the new LTS release at the time and improved aggregation performance.

## Details

I updated the version tags in docker-compose.yml and deployed through Portainer on the Log-Server VM. The stack was down for about 5 minutes while the containers came back up.

Three Graylog changes mattered for this upgrade:

- The dashboard API now requires entity wrappers.
- Pipeline regex capture groups use 0-based indexing.
- Creating a stream requires an explicit `index_set_id`.

## Result

All 5 pipelines and 13 dashboards worked after the upgrade. I updated the dashboard creation scripts to handle the new API format.
