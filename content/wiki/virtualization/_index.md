---
title: "Virtualization"
description: "Proxmox VE cluster, LXC containers, VMs, and backup strategies"
tags: ["wiki"]
topics: ["proxmox", "lxc", "docker", "virtualization"]
cover:
  image: "/images/featured-homelab.png"
  alt: "Server rack illustration"
  relative: false
---

My homelab runs on a **4-node Proxmox VE cluster** hosting 50+ LXC containers and VMs. This wiki documents the architecture, conventions, and lessons learned.

## Proxmox Cluster Architecture

{{< mermaid >}}
flowchart TB
    subgraph CLUSTER["🖥️ PROXMOX VE CLUSTER"]
        direction TB

        subgraph NODE2["📦 NODE 2"]
            direction TB
            N2_STORAGE["💾 LVM-thin SSD"]
            N2_LXC1["📦 PBS Backup"]
            N2_LXC2["📦 Python Dev"]
            N2_LXC3["📦 UpSnap"]
        end

        subgraph NODE3["📦 NODE 3"]
            direction TB
            N3_STORAGE["💾 ZFS Pool"]
            N3_LXC1["📦 Semaphore"]
            N3_LXC2["📦 CF-Tunnel"]
            N3_LXC3["📦 NetBox"]
            N3_LXC4["📦 PostgreSQL"]
            N3_LXC5["🌐 DNS-Primary"]
        end

        subgraph NODE5["📦 NODE 5"]
            direction TB
            N5_STORAGE["💾 LVM-thin SSD"]
            N5_VM1["🖥️ Graylog VM"]
            N5_LXC1["📦 n8n"]
            N5_LXC2["📦 Caddy-2"]
            N5_LXC3["📦 NFS-2"]
            N5_LXC4["🌐 DNS-Secondary"]
        end

        subgraph NODE6["📦 NODE 6"]
            direction TB
            N6_STORAGE["💾 ZFS Pool"]
            N6_VM1["🖥️ Docker-Main"]
            N6_VM2["🖥️ Home Assistant"]
            N6_LXC1["📦 Homarr"]
            N6_LXC2["📦 Caddy-1"]
            N6_LXC3["📦 NFS-1"]
        end
    end

    subgraph BACKUP["💾 BACKUP INFRASTRUCTURE"]
        PBS["🔒 Proxmox Backup Server<br/>LXC on Node-2"]
        NAS["📀 NAS Storage<br/>2TB Backup Pool"]
    end

    subgraph HA["🔄 HIGH AVAILABILITY"]
        DNS_VIP(("🌐 DNS VIP<br/>.110"))
        CADDY_VIP(("🔀 Caddy VIP<br/>.161"))
        NFS_VIP(("💾 NFS VIP<br/>.165"))
    end

    %% Backup connections
    NODE2 & NODE3 & NODE5 & NODE6 -->|"Backup"| PBS
    PBS -->|"Store"| NAS

    %% HA connections
    N3_LXC5 <-.->|"VRRP"| DNS_VIP
    N5_LXC4 <-.->|"VRRP"| DNS_VIP
    N6_LXC2 <-.->|"VRRP"| CADDY_VIP
    N5_LXC2 <-.->|"VRRP"| CADDY_VIP
    N6_LXC3 <-.->|"VRRP"| NFS_VIP
    N5_LXC3 <-.->|"VRRP"| NFS_VIP

    %% Styling
    classDef node fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef lvm fill:#fff3e0,stroke:#e65100,stroke-width:1px
    classDef zfs fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    classDef lxc fill:#fafafa,stroke:#616161,stroke-width:1px
    classDef vm fill:#f3e5f5,stroke:#6a1b9a,stroke-width:1px
    classDef dns fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef backup fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef vip fill:#bbdefb,stroke:#1565c0,stroke-width:3px

    class NODE2,NODE3,NODE5,NODE6 node
    class N2_STORAGE,N5_STORAGE lvm
    class N3_STORAGE,N6_STORAGE zfs
    class N2_LXC1,N2_LXC2,N2_LXC3,N3_LXC1,N3_LXC2,N3_LXC3,N3_LXC4,N5_LXC1,N5_LXC2,N5_LXC3,N6_LXC1,N6_LXC2,N6_LXC3 lxc
    class N5_VM1,N6_VM1,N6_VM2 vm
    class N3_LXC5,N5_LXC4 dns
    class PBS,NAS backup
    class DNS_VIP,CADDY_VIP,NFS_VIP vip
{{< /mermaid >}}

## Cluster Specifications

| Node | Storage | Type | CPU | RAM | Primary Workloads |
|------|---------|------|-----|-----|-------------------|
| **Node 2** | ssd-data | LVM-thin | 4 cores | 16 GB | PBS, Development |
| **Node 3** | zdata | ZFS | 4 cores | 32 GB | Databases, DNS-Primary |
| **Node 5** | ssd-data | LVM-thin | 4 cores | 16 GB | Graylog VM, DNS-Secondary |
| **Node 6** | zdata | ZFS | 4 cores | 32 GB | Docker-Main, HA services |

**Total Resources:**
- 🖥️ **16 CPU cores** available for VMs/LXCs
- 💾 **96 GB RAM** across cluster
- 📀 **~2 TB** combined storage (SSD + ZFS)
- 📦 **50+ containers** running

### Why Mixed Storage?

| Storage Type | Advantages | Best For |
|--------------|------------|----------|
| **LVM-thin** | Fast snapshots, thin provisioning, SSD optimized | General workloads, development |
| **ZFS** | Checksumming, compression, data integrity | Databases, critical data |

## VM/LXC ID Naming Convention

I use a **deterministic ID scheme** that encodes network location:

{{< mermaid >}}
flowchart LR
    subgraph FORMULA["📐 ID FORMULA"]
        VLAN["VLAN Number<br/>(10, 30, 40...)"]
        PLUS["+"]
        OCTET["Last IP Octet<br/>(.66, .111, .152...)"]
        EQUALS["="]
        VMID["VM/LXC ID"]
    end

    subgraph EXAMPLES["📋 EXAMPLES"]
        EX1["30 + 066 = <b>30066</b><br/>192.168.30.66 (Semaphore)"]
        EX2["10 + 111 = <b>10111</b><br/>192.168.10.111 (DNS-1)"]
        EX3["30 + 152 = <b>30152</b><br/>192.168.30.152 (Vaultwarden)"]
    end

    VLAN --> PLUS --> OCTET --> EQUALS --> VMID
{{< /mermaid >}}

**Benefits:**
- 🔍 Instantly know a container's IP from its ID
- ✅ Avoid IP conflicts during provisioning
- 📚 Simplify documentation and troubleshooting
- 🔢 Consistent across all 50+ containers

## Container Strategy

### LXC vs Docker Decision Tree

{{< mermaid >}}
flowchart TD
    START["New Service"] --> Q1{"Ships as<br/>Docker Compose?"}
    Q1 -->|"Yes"| Q2{"Stateful<br/>Database?"}
    Q1 -->|"No"| LXC["📦 Direct LXC<br/>systemd, full OS"]

    Q2 -->|"Yes"| DOCKER_LXC["📦 Docker-in-LXC<br/>Proxmox manages backups"]
    Q2 -->|"No"| Q3{"High I/O or<br/>Custom Kernel?"}

    Q3 -->|"Yes"| VM["🖥️ Full VM<br/>Dedicated resources"]
    Q3 -->|"No"| DOCKER_LXC

    classDef decision fill:#fff3e0,stroke:#e65100
    classDef lxc fill:#e8f5e9,stroke:#2e7d32
    classDef docker fill:#e3f2fd,stroke:#1565c0
    classDef vm fill:#f3e5f5,stroke:#6a1b9a

    class Q1,Q2,Q3 decision
    class LXC lxc
    class DOCKER_LXC docker
    class VM vm
{{< /mermaid >}}

| Aspect | LXC Containers | Docker-in-LXC | Full VM |
|--------|---------------|---------------|---------|
| **Isolation** | Full OS, systemd | Docker + OS | Complete |
| **Backup** | Proxmox snapshots | Proxmox + volumes | Proxmox snapshots |
| **Use Case** | Native services | Docker Compose apps | High I/O, special kernel |
| **Examples** | Pi-hole, Semaphore | Graylog, Caddy | Docker-Main, KASM |

### Docker-in-LXC Pattern

For services that ship as Docker Compose stacks:

{{< mermaid >}}
flowchart TB
    subgraph LXC["📦 LXC CONTAINER (Proxmox managed)"]
        subgraph DOCKER["🐳 Docker Engine"]
            direction TB
            subgraph APPS["Application Stack"]
                direction LR
                APP["📱 App"]
                DB["🗄️ Database"]
            end
            subgraph MGMT["Management"]
                WT["🔄 Watchtower<br/>(Auto-updates)"]
            end
        end
    end

    classDef lxc fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef docker fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef app fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    classDef db fill:#fff3e0,stroke:#e65100,stroke-width:1px
    classDef mgmt fill:#f3e5f5,stroke:#6a1b9a,stroke-width:1px

    class LXC lxc
    class DOCKER docker
    class APP app
    class DB db
    class WT mgmt
{{< /mermaid >}}

**Why not Docker directly on Proxmox?**
- ✅ Proxmox backups capture entire LXC state
- ✅ Network isolation via Proxmox VLANs
- ✅ Resource limits enforced at LXC level
- ✅ Easier migration between nodes

## High Availability Services

Three service categories run as **HA pairs** with automatic failover:

{{< mermaid >}}
flowchart TB
    subgraph DNS_PAIR["🌐 DNS HIGH AVAILABILITY"]
        direction LR
        D1["📦 DNS-Primary<br/>Node 3<br/>LXC 10111"]
        D_VIP(("VIP .110"))
        D2["📦 DNS-Secondary<br/>Node 5<br/>LXC 10112"]
        D1 <-.->|"VRRP ID: 55"| D_VIP
        D2 <-.->|"Priority: 100"| D_VIP
    end

    subgraph CADDY_PAIR["🔀 CADDY HIGH AVAILABILITY"]
        direction LR
        C1["📦 Caddy-1<br/>Node 6<br/>LXC 30160"]
        C_VIP(("VIP .161"))
        C2["📦 Caddy-2<br/>Node 5<br/>LXC 30162"]
        C1 <-.->|"VRRP ID: 61"| C_VIP
        C2 <-.->|"Priority: 100"| C_VIP
    end

    subgraph NFS_PAIR["💾 NFS HIGH AVAILABILITY"]
        direction LR
        N1["📦 NFS-1<br/>Node 6<br/>LXC 30164"]
        N_VIP(("VIP .165"))
        N2["📦 NFS-2<br/>Node 5<br/>LXC 30166"]
        N1 <-.->|"VRRP ID: 65"| N_VIP
        N2 <-.->|"rsync daily"| N_VIP
    end

    CADDY_PAIR -->|"Mount certs"| NFS_PAIR

    classDef primary fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    classDef secondary fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef vip fill:#bbdefb,stroke:#1565c0,stroke-width:3px

    class D1,C1,N1 primary
    class D2,C2,N2 secondary
    class D_VIP,C_VIP,N_VIP vip
{{< /mermaid >}}

| Service | Primary Node | Secondary Node | Failover Tech | RTO |
|---------|--------------|----------------|---------------|-----|
| **DNS** | Node 3 | Node 5 | keepalived VRRP | ~15s |
| **Caddy** | Node 6 | Node 5 | keepalived VRRP | ~10s |
| **NFS** | Node 6 | Node 5 | keepalived + rsync | ~10s |

**Node distribution strategy:** Primary services split across nodes 3/6, secondaries on node 5. This ensures a single node failure doesn't take down all primaries.

## Backup Strategy

### Proxmox Backup Server (PBS)

{{< mermaid >}}
flowchart LR
    subgraph SOURCES["📦 BACKUP SOURCES"]
        LXC1["LXC Containers"]
        VM1["Virtual Machines"]
    end

    subgraph PBS["🔒 PBS (Node 2)"]
        DEDUP["Deduplication"]
        COMPRESS["ZSTD Compression"]
        VERIFY["Verification Jobs"]
    end

    subgraph STORAGE["💾 STORAGE"]
        NAS["NAS NFS Share<br/>2TB Pool"]
    end

    LXC1 & VM1 -->|"Snapshot"| DEDUP
    DEDUP --> COMPRESS
    COMPRESS --> VERIFY
    VERIFY -->|"Store"| NAS

    classDef source fill:#e3f2fd,stroke:#1565c0
    classDef pbs fill:#fff3e0,stroke:#e65100
    classDef storage fill:#e8f5e9,stroke:#2e7d32

    class LXC1,VM1 source
    class DEDUP,COMPRESS,VERIFY pbs
    class NAS storage
{{< /mermaid >}}

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Storage** | NFS from NAS | Offsite from compute nodes |
| **Retention** | 7 backups | Weekly rotation |
| **Compression** | ZSTD | Good compression/speed balance |
| **Mode** | Snapshot | Live backups, no downtime |

**Schedules:**
- 🗑️ Garbage Collection: Daily at 02:00
- ✅ Verification: Weekly on Sunday at 03:00
- 💾 Backup Jobs: Staggered throughout night

### Application-Level Backups

Critical applications also have their own backup scripts:

{{< mermaid >}}
flowchart LR
    subgraph SOURCE["📦 SERVICE DATA"]
        DATA["Vaultwarden<br/>n8n<br/>etc."]
    end

    subgraph PROCESS["⚙️ BACKUP SCRIPT"]
        TAR["tar + gzip<br/>+ retention"]
    end

    subgraph DEST["💾 NFS SHARE"]
        NFS["/backups/<br/>BK_&lt;service&gt;"]
    end

    subgraph NOTIFY["📱 DISCORD"]
        DISCORD["Notification<br/>(status, size, count)"]
    end

    DATA --> TAR --> NFS --> DISCORD

    classDef source fill:#e3f2fd,stroke:#1565c0
    classDef process fill:#fff3e0,stroke:#e65100
    classDef dest fill:#e8f5e9,stroke:#2e7d32
    classDef notify fill:#f3e5f5,stroke:#6a1b9a

    class DATA source
    class TAR process
    class NFS dest
    class DISCORD notify
{{< /mermaid >}}

## Provisioning Automation

New VMs/LXCs are provisioned via a **Python automation tool**:

{{< mermaid >}}
flowchart LR
    subgraph INPUT["📝 INPUT"]
        REQ["Service Requirements"]
    end

    subgraph PROCESS["⚙️ AUTOMATION"]
        NETBOX["Query NetBox<br/>Next available IP"]
        CREATE["Create Container<br/>ID = VLAN + IP"]
        CONFIG["Configure<br/>SSH, TZ, packages"]
    end

    subgraph OUTPUT["✅ OUTPUT"]
        READY["Production-Ready<br/>Container"]
    end

    REQ --> NETBOX --> CREATE --> CONFIG --> READY

    classDef input fill:#fff3e0,stroke:#e65100
    classDef process fill:#e3f2fd,stroke:#1565c0
    classDef output fill:#e8f5e9,stroke:#2e7d32

    class REQ input
    class NETBOX,CREATE,CONFIG process
    class READY output
{{< /mermaid >}}

**Automation steps:**
1. Query NetBox for next available IP in target VLAN
2. Calculate VM ID using VLAN + IP scheme
3. Create container with correct storage selection
4. Configure SSH key access
5. Set timezone (`America/Los_Angeles`) and locale
6. Install base packages

**Result:** 30 seconds from request to production-ready container.

## Storage Selection Rules

| Node | Storage Pool | Type | When to Use |
|------|--------------|------|-------------|
| Node 2, 5 | `ssd-data` | LVM-thin | General workloads, fast I/O |
| Node 3, 6 | `zdata` | ZFS | Data integrity critical, databases |
| All | **Never use `local`** | - | Reserved for Proxmox system |

## LXC Privilege Levels

| Type | Use Case | Security | Examples |
|------|----------|----------|----------|
| **Unprivileged** | Most containers | ✅ Recommended | Pi-hole, Semaphore, n8n |
| **Privileged** | Special requirements | ⚠️ Use sparingly | PBS, Docker hosts, NFS |

**Privileged container requirements:**
- PBS: Raw device access for backups
- Docker hosts: cgroup access
- NFS servers: Kernel module access

## Resource Management

### Over-Provisioning Strategy

Proxmox allows RAM over-provisioning. My approach:

| Metric | Allocated | Physical | Ratio |
|--------|-----------|----------|-------|
| **RAM** | ~140 GB | 96 GB | 1.5x |
| **CPU** | Variable | 16 cores | Dynamic |

**Why it works:** Containers rarely all peak simultaneously. Monitor with Pulse dashboard to catch issues early.

### Template Library

Golden image templates accelerate deployment:

| Template | Contents | Deploy Time |
|----------|----------|-------------|
| **Base Debian** | SSH keys, timezone, core packages | 30 seconds |
| **Docker-ready** | Base + Docker + Compose | 45 seconds |
| **Python Dev** | Base + pyenv + common libraries | 60 seconds |

## Lessons Learned

### 1. ID Scheme Prevents Chaos

Before the VLAN+IP naming convention, I had random VM IDs and constantly forgot which IP belonged to which container. The deterministic scheme eliminated this entirely.

### 2. Split HA Across Nodes

Initially had both DNS containers on adjacent nodes. A single network issue took down both. Now primaries and secondaries are deliberately split.

### 3. ZFS for Databases

Early database containers ran on LVM-thin. After a corruption incident (power loss during write), moved all databases to ZFS with checksumming.

### 4. Template Everything

Creating a new container manually took 30 minutes of package installation and configuration. Templates reduced this to under a minute.

### 5. Monitor Over-Provisioning

RAM over-provisioning works great—until it doesn't. The Pulse dashboard caught a memory pressure event before it became an outage.

## Related Pages

- [Networking]({{< relref "/wiki/networking" >}}) - VLAN configuration, DNS architecture
- [Monitoring]({{< relref "/wiki/monitoring" >}}) - Cluster monitoring with Pulse
- [Automation]({{< relref "/wiki/automation" >}}) - Provisioning scripts
