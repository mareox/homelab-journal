---
title: "About"
date: 2025-01-24
description: "Why I keep this homelab journal, what I write about, and where to find me"
showTableOfContents: false
---

![A laptop and notes on a workbench](../images/banner-about.png)

## Why This Journal Exists

I've learned more from random blog posts than from official documentation. Someone's 3 AM troubleshooting session, written up the next morning, has saved me countless hours. I'm writing down what worked in my lab so the next person has somewhere to start.

## What You'll Find

| Section | What It Contains |
|---------|-----------------|
| **[Wiki]({{< relref "/wiki" >}})** | Reference notes I update as I learn |
| **[Tutorials]({{< relref "/tutorials" >}})** | Step-by-step guides you can follow in your own lab |
| **[Journal]({{< relref "/journal" >}})** | Short entries on what changed and why |
| **[Posts]({{< relref "/posts" >}})** | Deep dives and lessons learned from failures |

## My Philosophy

> "Build it yourself, understand how it works, and learn from every failure."

Three principles guide my homelab:

1. I self-host services when it makes sense to run them myself.
2. If I do it twice, I script it.
3. I write down what I did because I know I'll forget.

## Topics Covered

- **Virtualization** with Proxmox VE, LXC containers, and Docker
- **Networking** with VLANs, firewalls, and high-availability DNS
- **Automation** with n8n workflows, Ansible, and CI/CD
- **Monitoring** through centralized logging, alerting, and observability
- **Security** through defense in depth, access control, and backups

## A Note on Security

I use placeholders like these for private details in examples.

| Real Value | Shown As |
|------------|----------|
| IP addresses | `<YOUR_IP>` or role names |
| Domains | `<YOUR_DOMAIN>` |
| Credentials | `<YOUR_PASSWORD>` |
| Hostnames | `DNS-Primary`, `Proxmox-Node-1`, etc. |

These notes describe what I tried in my lab. Test the steps in your own environment before deploying them.

## Connect

- **Resume**: [mareox.github.io/resume](https://mareox.github.io/resume)
- **LinkedIn**: [linkedin.com/in/mareox](https://linkedin.com/in/mareox)
- **GitHub**: [mareox](https://github.com/mareox)

---

*Thanks for reading. I hope something here saves you a few hours.*
