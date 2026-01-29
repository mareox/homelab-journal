---
title: "Virtualization"
description: "Proxmox VE cluster, LXC containers, VMs, and backup strategies"
tags: ["wiki"]
topics: ["proxmox", "lxc", "docker", "virtualization"]
---

My homelab runs on a **4-node Proxmox VE cluster** hosting 50+ LXC containers and VMs. This wiki documents the architecture, conventions, and lessons learned.

## Cluster Architecture

{{< mermaid >}}
graph TB
    subgraph "Proxmox Cluster"
        PVE2[Node 2<br/>LVM-thin Storage]
        PVE3[Node 3<br/>ZFS Storage]
        PVE5[Node 5<br/>LVM-thin Storage]
        PVE6[Node 6<br/>ZFS Storage]
    end

    subgraph "Backup Infrastructure"
        PBS[Proxmox Backup Server<br/>LXC Container]
        NAS[NAS Storage<br/>2TB Backup Pool]
    end

    PVE2 & PVE3 & PVE5 & PVE6 --> PBS
    PBS --> NAS
{{< /mermaid >}}

### Node Specifications

| Node | Storage Type | Primary Use | Status |
|------|-------------|-------------|--------|
| Node 2 | LVM-thin (SSD) | General workloads | Active |
| Node 3 | ZFS | Database workloads | Active |
| Node 5 | LVM-thin (SSD) | General workloads | Active |
| Node 6 | ZFS | Container workloads | Active |

**Why mixed storage?** LVM-thin excels at thin provisioning and fast snapshots. ZFS provides checksumming and compression for data integrity. Matching workloads to storage types optimizes performance.

## VM/LXC ID Naming Convention

I use a **deterministic ID scheme** that encodes network location:

```
VM ID = VLAN + Last IP Octet

Examples:
- ID 30066 = VLAN 30 + IP .66 → 192.168.30.66
- ID 10111 = VLAN 10 + IP .111 → 192.168.10.111
```

**Benefits:**
- Instantly know a container's IP from its ID
- Avoid IP conflicts during provisioning
- Simplify documentation and troubleshooting

## LXC vs Docker

I run most services as **LXC containers**, not Docker:

| Aspect | LXC Containers | Docker Containers |
|--------|---------------|-------------------|
| **Isolation** | Full OS, systemd support | Application-level |
| **Persistence** | Stateful by default | Ephemeral by design |
| **Management** | Proxmox UI + SSH | Docker CLI/Compose |
| **Backup** | Proxmox snapshots | Volume management |
| **Use Case** | Long-running services | Microservices, dev |

**My approach:** LXC for stateful services (databases, monitoring), Docker-in-LXC for applications that benefit from containerization (Graylog stack, reverse proxy).

### Docker-in-LXC Pattern

For services that ship as Docker Compose stacks, I run Docker inside an LXC:

```
LXC Container (Proxmox managed)
└── Docker Engine
    ├── Application Container
    ├── Database Container
    └── Watchtower (auto-updates)
```

**Why not Docker directly on Proxmox?**
- Proxmox backups capture entire LXC state
- Network isolation via Proxmox VLANs
- Resource limits enforced at LXC level
- Easier migration between nodes

## High Availability Patterns

Three service categories run as **HA pairs** with automatic failover:

### 1. DNS (Pi-hole)

| Role | Description |
|------|-------------|
| Primary | Priority 200, handles all queries |
| Backup | Priority 100, takes over on failure |
| VIP | Floating IP that clients use |

Technology: **keepalived (VRRP)** with health checks every 5 seconds.

### 2. Reverse Proxy (Caddy)

Same pattern—two Caddy nodes with shared certificate storage via NFS.

### 3. Certificate Storage (NFS)

HA NFS pair syncs TLS certificates between Caddy nodes.

**Lesson learned:** Always deploy config changes to BOTH nodes. Config drift between HA pairs has caused multiple outages.

## Backup Strategy

### Proxmox Backup Server (PBS)

Centralized backup storage running as an LXC container:

| Setting | Value | Rationale |
|---------|-------|-----------|
| Storage | NFS from NAS | Offsite from compute nodes |
| Retention | 7 backups | Weekly rotation |
| Compression | ZSTD | Good compression/speed balance |
| Mode | Snapshot | Live backups, no downtime |

**Schedule:**
- Garbage Collection: Daily at 02:00
- Verification: Weekly on Sunday at 03:00

### Application-Level Backups

Critical applications also have their own backup scripts:

```
Service → Local backup script → NFS share → Retention cleanup
                                    ↓
                              Discord notification
```

Services with custom backups: Vaultwarden, n8n workflows, Graylog config.

## Provisioning Automation

New VMs/LXCs are provisioned via a **Python automation tool** that:

1. Queries NetBox for next available IP
2. Creates container with correct ID (VLAN + IP scheme)
3. Configures SSH key access
4. Sets timezone and locale
5. Installs base packages

This ensures consistency across all 50+ containers.

## Storage Selection Rules

| Node Storage | When to Use |
|--------------|-------------|
| `ssd-data` (LVM-thin) | General workloads, fast I/O |
| `zdata` (ZFS) | Data integrity critical, databases |
| Never use `local` | Reserved for Proxmox system |

## Lessons Learned

### 1. ID Scheme Prevents Chaos

Before the VLAN+IP naming convention, I had random VM IDs and constantly forgot which IP belonged to which container. The deterministic scheme eliminated this entirely.

### 2. LXC Privileged vs Unprivileged

Most containers run **unprivileged** for security. Exceptions:
- PBS (needs raw device access for backups)
- Docker hosts (needs cgroup access)
- NFS servers (needs kernel module access)

### 3. Resource Over-Provisioning

Proxmox allows over-provisioning RAM across nodes. I allocate ~150% of physical RAM across all containers, knowing they rarely all peak simultaneously. Monitor with Pulse dashboard.

### 4. Template Everything

Golden image templates for:
- Base Debian LXC (SSH keys, timezone, packages)
- Docker-ready LXC (Docker + Compose pre-installed)
- Python development LXC (pyenv, common libraries)

Creating a new container from template takes 30 seconds vs 30 minutes manual setup.

## Related Pages

- [Networking](/wiki/networking/) - VLAN configuration, DNS architecture
- [Monitoring](/wiki/monitoring/) - Cluster monitoring with Pulse
- [Automation](/wiki/automation/) - Provisioning scripts
