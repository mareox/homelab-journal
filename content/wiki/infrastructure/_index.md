---
title: "Infrastructure"
description: "Proxmox VE cluster, LXC containers, VMs, Docker, storage, and backup strategies"
tags: ["wiki"]
topics: ["proxmox", "lxc", "docker", "virtualization", "infrastructure"]
---

![Compute, network, and storage equipment in a rack](../../images/banner-infrastructure.png)

My 4-node Proxmox VE cluster runs 50+ LXC containers and VMs. These are the conventions I use to place, name, and back up those guests.

## Proxmox Cluster Architecture

![Proxmox Cluster Architecture](cluster-architecture.svg)

## Cluster Specifications

| Node | Storage | Type | CPU | RAM | Primary Workloads |
|------|---------|------|-----|-----|-------------------|
| **Backup and development host** | ssd-data | LVM-thin | 4 cores | 16 GB | PBS, Development |
| **Database host** | zdata | ZFS | 4 cores | 32 GB | Databases, DNS-Primary |
| **Logging host** | ssd-data | LVM-thin | 4 cores | 16 GB | Graylog VM, DNS-Secondary |
| **Container host** | zdata | ZFS | 4 cores | 32 GB | Docker-Main, HA services |

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

I assign VM and LXC IDs from their network location so I can work out where a guest lives from its ID.

![VM/LXC ID Formula](id-formula.svg)

**Benefits:**
- 🔍 Instantly know a container's IP from its ID
- ✅ Avoid IP conflicts during provisioning
- 📚 Simplify documentation and troubleshooting
- 🔢 Consistent across all 50+ containers

## Container Strategy

### LXC vs Docker Decision Tree

![LXC vs Docker Decision Tree](lxc-vs-docker.svg)

| Aspect | LXC Containers | Docker-in-LXC | Full VM |
|--------|---------------|---------------|---------|
| **Isolation** | Full OS, systemd | Docker + OS | Complete |
| **Backup** | Proxmox snapshots | Proxmox + volumes | Proxmox snapshots |
| **Use Case** | Native services | Docker Compose apps | High I/O, special kernel |
| **Examples** | Pi-hole, Semaphore | Graylog, Caddy | Docker-Main, KASM |

### Docker-in-LXC Pattern

For services that ship as Docker Compose stacks:

![Docker-in-LXC Pattern](docker-in-lxc.svg)

**Why not Docker directly on Proxmox?**
- ✅ Proxmox backups capture entire LXC state
- ✅ Network isolation via Proxmox VLANs
- ✅ Resource limits enforced at LXC level
- ✅ Easier migration between nodes

## High Availability Services

Three service categories run as **HA pairs** with automatic failover:

![High Availability Pairs](ha-pairs.svg)

| Service | Primary Node | Secondary Node | Failover Tech | RTO |
|---------|--------------|----------------|---------------|-----|
| **DNS** | Resolver-Primary | Resolver-Secondary | keepalived VRRP | ~15s |
| **Caddy** | Proxy-Primary | Proxy-Secondary | keepalived VRRP | ~10s |
| **NFS** | Storage-Primary | Storage-Secondary | keepalived + rsync | ~10s |

I put primary and standby services on separate hosts. I also spread the primary roles across hosts so one failure does not take all of them down.

## Backup Strategy

### Proxmox Backup Server (PBS)

![PBS Backup Pipeline](pbs-backup.svg)

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

![Application-Level Backup Pipeline](app-backup.svg)

## Provisioning Automation

Nautobot and Semaphore handle provisioning for new services. I retired the Python provisioning tool.

![Provisioning Automation](provisioning.svg)

**Lifecycle sequence:**
1. Reserve the IP and lifecycle record in Nautobot (`Nautobot Lifecycle`, `action=reserve`)
2. Provision the LXC through Semaphore's Ansible playbook (ID = VLAN + last IP octet, correct storage pool)
3. Register the service: DNS record, reverse proxy, dashboard tile
4. Activate the Nautobot reservation once the service is registered and has a backup

I chose this sequence so I can tell what happened at each step and have a way to roll it back.

## Storage Selection Rules

| Node | Storage Pool | Type | When to Use |
|------|--------------|------|-------------|
| SSD hosts | `ssd-data` | LVM-thin | General workloads, fast I/O |
| ZFS hosts | `zdata` | ZFS | Data integrity critical, databases |
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

Proxmox lets me allocate more RAM to guests than the host has physically.

| Metric | Allocated | Physical | Ratio |
|--------|-----------|----------|-------|
| **RAM** | ~140 GB | 96 GB | 1.5x |
| **CPU** | Variable | 16 cores | Dynamic |

The containers rarely peak at the same time. I watch the Pulse dashboard for memory pressure.

### Template Library

Golden image templates accelerate deployment:

| Template | Contents | Deploy Time |
|----------|----------|-------------|
| **Base Debian** | SSH keys, timezone, core packages | 30 seconds |
| **Docker-ready** | Base + Docker + Compose | 45 seconds |
| **Python Dev** | Base + pyenv + common libraries | 60 seconds |

## Lessons Learned

### 1. ID Scheme Prevents Chaos

When I assigned VM IDs at random, I kept forgetting which IP belonged to which container. Now the VLAN and IP convention gives me the answer from the ID.

### 2. Split HA Across Nodes

I originally put both DNS containers on adjacent nodes. One network issue took both down. Now I split primaries and secondaries across nodes.

### 3. ZFS for Databases

My database containers started out on LVM-thin. A power loss mid-write corrupted data, so I moved all databases to ZFS with checksumming.

### 4. Template Everything

Creating a new container manually took 30 minutes of package installation and configuration. Templates reduced this to under a minute.

### 5. Monitor Over-Provisioning

The Pulse dashboard showed me a memory pressure event before it became an outage. That's what I watch when I over-provision RAM.

## Related Pages

- [Networking](../networking/) - VLAN configuration, DNS architecture
- [Observability](../observability/) - Cluster monitoring with Pulse
- [Automation](../automation/) - Provisioning scripts
