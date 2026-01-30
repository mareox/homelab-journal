---
title: "Homelab Journal"
description: "Documenting my journey building, automating, and learning from a self-hosted infrastructure"
cover:
  image: "/images/banner-home.png"
  alt: "Homelab server illustration"
  relative: false
---

![Homelab Infrastructure](/homelab-journal/images/banner-home.png)

## Welcome

This is my homelab journal — a documentation of everything I've learned building self-hosted infrastructure from scratch. What started as a Raspberry Pi running Pi-hole has grown into a 4-node Proxmox cluster running 50+ services.

**Why document this?** Because I've learned more from other people's blogs than from any official documentation. This is my way of giving back.

---

## What's Running

{{< mermaid >}}
flowchart LR
    subgraph COMPUTE["🖥️ Compute"]
        PVE["4-Node Proxmox Cluster<br/>50+ VMs/LXCs"]
    end

    subgraph NETWORK["🌐 Network"]
        FW["PA-440 Firewall<br/>5 VLANs"]
        DNS["HA Pi-hole DNS<br/>&lt;15s failover"]
    end

    subgraph SERVICES["📦 Services"]
        PROXY["HA Caddy Proxy"]
        LOG["Graylog + OpenSearch"]
        AUTO["n8n + Semaphore"]
    end

    subgraph STORAGE["💾 Storage"]
        NAS["Synology NAS<br/>PBS Backups"]
    end

    PVE --> SERVICES
    FW --> DNS
    SERVICES --> STORAGE

    classDef compute fill:#e3f2fd,stroke:#1565c0
    classDef network fill:#fff3e0,stroke:#e65100
    classDef services fill:#e8f5e9,stroke:#2e7d32
    classDef storage fill:#f3e5f5,stroke:#6a1b9a

    class COMPUTE compute
    class NETWORK network
    class SERVICES services
    class STORAGE storage
{{< /mermaid >}}

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
