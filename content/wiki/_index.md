---
title: "Wiki"
description: "Reference notes for the tools and systems I run in my homelab."
groupByYear: false
cascade:
  showHero: true
  heroStyle: "basic"
  showTableOfContents: true
  showReadingTime: false
  showDate: false
---

![A reference binder with topic tabs](../images/banner-wiki.png)

I keep these reference pages up to date as I learn more. The posts capture what happened at the time.

## Topics

### [Security](security/)
**Next-gen firewall, XDR, certificates, and threat detection**

I run a PA-440 with App-ID and zone-based policies, use Wazuh XDR to monitor endpoints, and automate certificate management. Vaultwarden is self-hosted and has two traffic paths to secure.

### [Networking](networking/)
**VLANs, high-availability DNS, firewalls, and reverse proxy architecture**

5-VLAN network design with multi-tier DNS (firewall caching → Pi-hole HA → Cloudflare), Palo Alto PA-440 next-gen firewall, and dual reverse proxy architecture (Cloudflare Tunnel + Caddy HA).

### [Infrastructure](infrastructure/)
**Proxmox VE cluster, LXC containers, VMs, Docker, and backup strategies**

My 4-node Proxmox cluster runs 50+ LXC containers and VMs. I explain how I assign predictable VM IDs, when I choose LXC or Docker, and how I use keepalived for HA and Proxmox Backup Server for backups.

### [Automation](automation/)
**n8n workflows, Semaphore CI/CD, scripts, and infrastructure as code**

I use n8n for event-driven workflows and Semaphore to run Ansible playbooks. This section also covers the shared backup scripts, GitOps deployments, and the Discord bot I use to manage infrastructure.

### [Observability](observability/)
**Centralized logging with Graylog, uptime monitoring, alerting, and dashboards**

Graylog 7 collects logs and runs them through 5 processing pipelines, with 13 dashboards to help me make sense of the output. Two Uptime Kuma instances check availability, and Discord gets the alerts I need to act on.

### [AI Tooling](ai-tooling/)
**Claude Code architecture, agent patterns, and AI-assisted workflows**

4-layer agentic architecture (Justfile → Commands → Skills → Agents), automated blog pipeline, and AI-augmented infrastructure operations with Claude Code.

---

## Architecture Highlights

**Defense in Depth:**
- PA-440 firewall with App-ID and zone-based policies
- Wazuh XDR for endpoint and container threat detection
- Cloudflare Tunnel for authenticated external access
- VLAN segmentation isolating IoT from servers

**High Availability:**
- Pi-hole DNS: <15 second failover
- Caddy reverse proxy: Shared certs via HA NFS
- All critical services have redundancy

**Observability:**
- Centralized logging captures firewall, DNS, proxy, and NAS
- Uptime monitoring with 1-minute intervals for critical services
- Discord notifications for all state changes

**Automation:**
- GitOps: Configs in Git, deployed via Portainer/Semaphore
- WUD (What's Up Docker): Opt-in container update monitoring with Discord notifications
- Scheduled power management: Non-essential VMs sleep overnight
