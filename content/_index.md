---
title: "Homelab Journal"
description: "Documenting my journey building, automating, and learning from a self-hosted infrastructure"
featureimage: "/images/banner-home.png"
---

![Homelab Infrastructure](images/banner-home.png)

## Welcome

This is my homelab journal — a documentation of everything I've learned building self-hosted infrastructure from scratch. What started as a Raspberry Pi running Pi-hole has grown into a 4-node Proxmox cluster running 50+ services.

**Why document this?** Because I've learned more from other people's blogs than from any official documentation. This is my way of giving back.

**Who am I?** — I'm Mario, a Senior Security Consultant at Palo Alto Networks with 8+ years in network security. By day I manage one of PANW's largest global SASE deployments (100K+ users, 34 regions). By night I build this. [Resume →](https://mareox.github.io/resume)

**Built with AI** — This site is created with the help of [Claude Code](https://claude.ai/code). The diagrams, banners, and even some of the writing are AI-assisted. Hence the consistent "vibe" you'll notice throughout. It's an experiment in human-AI collaboration for technical documentation.

---

## What's Running

![Homelab Infrastructure Overview](homelab-overview.svg)

---

## Quick Stats

| What | How Many |
|------|----------|
| **Proxmox Nodes** | 4 active |
| **VMs/LXCs** | 50+ |
| **VLANs** | 5 segmented networks |
| **HA Services** | 3 pairs (DNS, Proxy, NFS) |
| **Automated Backups** | 10+ services |
| **Graylog Dashboards** | 13 |

---

## Start Here

- **[Wiki]({{< relref "/wiki" >}})** — Reference documentation by topic
- **[Tutorials]({{< relref "/tutorials" >}})** — Step-by-step guides you can follow
- **[Journal]({{< relref "/journal" >}})** — Chronological changelog of changes
- **[Posts]({{< relref "/posts" >}})** — Lessons learned and deep dives
- **[About]({{< relref "/about" >}})** — Why I do this
