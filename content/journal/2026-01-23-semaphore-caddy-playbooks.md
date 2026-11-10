---
title: "Semaphore Caddy Domain Management Playbooks"
date: 2026-01-23
tags: ["journal", "automation"]
topics: ["semaphore", "caddy", "ansible", "reverse-proxy"]
description: "I moved Caddy domain changes into Semaphore so the same validated config reaches both nodes."
---

## What Changed

Adding a domain meant opening two SSH sessions and editing Caddy by hand. Missing a change on either node could leave the pair out of sync, and that had already caused outages.

I added three Ansible playbooks to Semaphore:

- **Add Domain** creates a reverse proxy entry on both nodes.
- **Remove Domain** removes it from both.
- **List Domains** shows the domains configured across the pair.

## Details

The playbooks are `caddy-add-domain.yml`, `caddy-remove-domain.yml`, and `caddy-list-domains.yml`. The Semaphore templates take the domain name, backend IP and port, and TLS settings. They run `caddy validate` before applying changes to both nodes.

## Result

Managing a domain takes about 30 seconds in Semaphore. The manual edit took 5 minutes or more, and it was easy to miss the second node.
