---
title: "About"
date: 2025-01-24
description: "About this homelab journal and its author"
showToc: false
---

![Developer Workspace](/homelab-journal/images/banner-about.png)

## Why This Journal Exists

I've learned more from random blog posts than from official documentation. Someone's 3 AM troubleshooting session, written up the next morning, has saved me countless hours. This journal is my contribution back to that tradition.

## What You'll Find

| Section | What It Contains |
|---------|-----------------|
| **[Wiki]({{< relref "/wiki" >}})** | Evergreen reference docs — updated as I learn |
| **[Tutorials]({{< relref "/tutorials" >}})** | Step-by-step guides you can follow in your own lab |
| **[Journal]({{< relref "/journal" >}})** | Quick changelog entries — what changed and why |
| **[Posts]({{< relref "/posts" >}})** | Deep dives and lessons learned from failures |

## My Philosophy

> "Build it yourself, understand how it works, and learn from every failure."

Three principles guide my homelab:

1. **Self-host where practical** — Not everything needs to live in the cloud
2. **Automate the toil** — If I do it twice, I script it
3. **Document everything** — Future me will forget; past me should write it down

## Topics Covered

- **Virtualization** — Proxmox VE, LXC containers, Docker
- **Networking** — VLANs, firewalls, high-availability DNS
- **Automation** — n8n workflows, Ansible, CI/CD
- **Monitoring** — Centralized logging, alerting, observability
- **Security** — Defense in depth, access control, backups

## A Note on Security

All examples use sanitized placeholders:

| Real Value | Shown As |
|------------|----------|
| IP addresses | `<YOUR_IP>` or role names |
| Domains | `<YOUR_DOMAIN>` |
| Credentials | `<YOUR_PASSWORD>` |
| Hostnames | `DNS-Primary`, `Proxmox-Node-1`, etc. |

**This is a learning journal, not production-grade documentation.** Always test in your own environment before deploying.

## Connect

- **Resume**: [mareox.github.io/resume](https://mareox.github.io/resume)
- **GitHub**: [mareox](https://github.com/mareox)
- **This Site**: [Source Code](https://github.com/mareox/homelab-journal)

---

*Thanks for reading. I hope something here saves you a few hours.*
