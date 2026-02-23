---
title: "Wiki"
description: "Reference documentation for homelab technologies"
groupByYear: false
cascade:
  showHero: true
  heroStyle: "basic"
  showTableOfContents: true
  showReadingTime: false
  showDate: false
---

![Knowledge Base](../images/banner-wiki.png)

Evergreen reference documentation organized by topic. Unlike blog posts, these pages are updated over time as I learn more.

## Topics

### [Security](security/)
**Next-gen firewall, XDR, certificates, and threat detection**

Enterprise security at home: PA-440 firewall with App-ID and zone-based policies, Wazuh XDR for endpoint detection, automated certificate lifecycle management, and self-hosted Vaultwarden with dual-path traffic security.

### [Networking](networking/)
**VLANs, high-availability DNS, firewalls, and reverse proxy architecture**

5-VLAN network design with multi-tier DNS (firewall caching → Pi-hole HA → Cloudflare), Palo Alto PA-440 next-gen firewall, and dual reverse proxy architecture (Cloudflare Tunnel + Caddy HA).

### [Infrastructure](infrastructure/)
**Proxmox VE cluster, LXC containers, VMs, Docker, and backup strategies**

4-node Proxmox cluster running 50+ LXC containers and VMs. Covers the deterministic VM ID naming convention, LXC vs Docker decisions, HA patterns with keepalived, and Proxmox Backup Server integration.

### [Automation](automation/)
**n8n workflows, Semaphore CI/CD, scripts, and infrastructure as code**

Event-driven automation with n8n, Ansible playbooks via Semaphore, standardized backup scripts, and GitOps deployment patterns. Includes Discord bot integration for conversational infrastructure management.

### [Observability](observability/)
**Centralized logging with Graylog, uptime monitoring, alerting, and dashboards**

Graylog 7 log aggregation with 5 processing pipelines and 13 dashboards. Dual Uptime Kuma instances for redundant availability monitoring. Discord-based alerting with fatigue prevention.

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
