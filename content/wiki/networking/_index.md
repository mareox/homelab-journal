---
title: "Networking"
description: "VLANs, high-availability DNS, firewalls, and reverse proxy architecture"
tags: ["wiki"]
topics: ["networking", "dns", "firewall", "vlan", "caddy"]
---

My homelab network is segmented into **5 VLANs** with a multi-tier DNS architecture and high-availability reverse proxy. This wiki covers the design decisions and implementation details.

## Network Architecture

{{< mermaid >}}
graph TB
    subgraph "External"
        Internet[Internet]
        CF[Cloudflare Tunnel]
    end

    subgraph "Edge"
        FW[Next-Gen Firewall<br/>PA-440]
        Router[UniFi Gateway]
    end

    subgraph "VLANs"
        VLAN10[VLAN 10<br/>Management]
        VLAN30[VLAN 30<br/>Servers]
        VLAN40[VLAN 40<br/>Isolated]
        VLAN50[VLAN 50<br/>IoT]
    end

    Internet --> FW
    FW --> Router
    CF --> FW
    Router --> VLAN10 & VLAN30 & VLAN40 & VLAN50
{{< /mermaid >}}

## VLAN Design

| VLAN | Subnet | Purpose | Key Services |
|------|--------|---------|--------------|
| 10 | 192.168.10.0/24 | Management & Core | NAS, DNS servers, KVM devices |
| 30 | 192.168.30.0/24 | Server Network | Proxmox cluster, Docker hosts, apps |
| 40 | 172.30.40.0/24 | Isolated Services | Restricted network access |
| 50 | 172.30.50.0/24 | IoT Devices | Smart home, isolated |
| 254 | 10.254.254.0/24 | Firewall Management | Out-of-band management |

**Design principle:** Servers (VLAN 30) can reach management (VLAN 10), but management devices are protected from server-initiated connections. IoT devices are fully isolated.

## DNS Architecture

### Multi-Tier Design

The DNS stack uses a **three-tier architecture** for performance, redundancy, and ad-blocking:

{{< mermaid >}}
graph LR
    Client[Client Device]
    FW[Firewall DNS Proxy<br/>Caching + Static Entries]
    PIHOLE[Pi-hole HA Pair<br/>Ad-blocking + Logging]
    UPSTREAM[Upstream DNS<br/>Cloudflare 1.1.1.1]

    Client --> FW
    FW --> |"Local domains"| PIHOLE
    FW --> |"External queries"| UPSTREAM
    PIHOLE --> UPSTREAM
{{< /mermaid >}}

### Layer 1: Firewall DNS Proxy

The Palo Alto firewall provides the first DNS layer:

| Feature | Benefit |
|---------|---------|
| **Caching** | Sub-10ms response for repeated queries |
| **Static Entries** | Core infrastructure resolves instantly (<5ms) |
| **Domain Routing** | Local domains → Pi-hole, external → Cloudflare |
| **DHCP Integration** | All VLANs receive firewall as DNS server |

**Static entries** include Proxmox nodes, NAS devices, and firewall interfaces—services that must resolve even if Pi-hole is down.

### Layer 2: Pi-hole HA

Two Pi-hole instances with automatic failover:

| Component | Description |
|-----------|-------------|
| **Primary** | Priority 200, handles all queries normally |
| **Secondary** | Priority 100, takes over on primary failure |
| **Virtual IP** | Floating IP that firewall DNS proxy targets |
| **Technology** | keepalived (VRRP) |

**Failover timing:**
- Health check interval: 5 seconds
- Failures before failover: 3 consecutive
- Recovery Time Objective: ~15 seconds

**Health checks verify:**
1. FTL service is running
2. Port 53 is listening
3. DNS queries resolve (tests dns.google, cloudflare)

### Layer 3: Upstream DNS

Pi-hole forwards to Cloudflare for external resolution:
- Primary: Firewall (which uses Cloudflare)
- Fallback: Direct to Cloudflare 1.1.1.2

### DNS Performance

| Query Type | Response Time |
|------------|---------------|
| Firewall static entry | <5ms |
| Firewall cached | <10ms |
| Pi-hole cached | 10-30ms |
| Uncached (full lookup) | 50-150ms |

## High-Availability Pairs

Three critical services run as HA pairs:

| Service | Primary | Secondary | VIP | Failover Tech |
|---------|---------|-----------|-----|---------------|
| DNS | Pi-hole 1 | Pi-hole 2 | .110 | keepalived VRRP |
| Reverse Proxy | Caddy 1 | Caddy 2 | .161 | keepalived VRRP |
| Cert Storage | NFS 1 | NFS 2 | .165 | keepalived + rsync |

### HA Pattern

All three follow the same architecture:

```
┌─────────────┐     ┌─────────────┐
│  Primary    │     │  Secondary  │
│  Prio: 200  │     │  Prio: 100  │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └───────┬───────────┘
               │
        ┌──────▼──────┐
        │  Virtual IP  │
        │  (Floating)  │
        └─────────────┘
```

**Key settings:**
- VRRP ID: Unique per service (55 for DNS, 61 for Caddy, 65 for NFS)
- Preemption: Enabled (primary reclaims VIP on recovery)
- Notifications: Discord webhooks on state changes

## Reverse Proxy Architecture

### Dual-Proxy Design

Two proxy paths serve different access patterns:

| Proxy | Purpose | Auth | Use Case |
|-------|---------|------|----------|
| Cloudflare Tunnel | External access | Cloudflare Access | Public-facing services |
| Caddy HA | Internal + direct external | None (service-level) | Internal services, high-throughput |

### Cloudflare Tunnel Path

```
Internet → Cloudflare (Auth) → Tunnel Agent → Backend Service
```

**Benefits:**
- Zero exposed firewall ports (outbound-only)
- DDoS protection included
- User identity via Cloudflare Access

**Protected services:** Password manager, VPN management, media server.

### Caddy HA Path

```
Internal/Direct → Caddy VIP → Backend Service
```

**Benefits:**
- No external dependency
- Lower latency for internal traffic
- Full control over TLS certificates

### Domain Tiers

Three domain patterns for different access levels:

| Pattern | Example | Purpose |
|---------|---------|---------|
| `*.local` | `service.homelab.local` | Direct backend access (no TLS) |
| `*.loc.domain.com` | `service.loc.domain.com` | Internal TLS via wildcard cert |
| `*.domain.com` | `service.domain.com` | External via Cloudflare |

**New service checklist:**
1. Add to `loc.domain.com` Caddy config (internal TLS)
2. Add to `domain.com` Caddy config (external access)
3. Add to Cloudflare Tunnel if authenticated access needed

## Firewall Architecture

### Palo Alto Networks PA-440

The homelab runs a **PA-440 next-gen firewall** with:

| Feature | Usage |
|---------|-------|
| **App-ID** | Application-aware traffic inspection |
| **DNS Proxy** | Intelligent caching and routing |
| **DHCP Server** | Centralized IP assignment for all VLANs |
| **NAT** | Destination/source translation for services |
| **Zone Security** | VLAN-based access policies |

### Security Zones

| Zone | VLANs | Trust Level |
|------|-------|-------------|
| L3-LAN10 | 10 | High (management) |
| L3-INFRA | 30 | Medium (servers) |
| L3-ISOLATED | 40, 50 | Low (restricted) |
| L3-UNTRUST | - | None (internet) |

**Key policies:**
- Servers can reach management for NAS/backup access
- IoT cannot initiate connections to other zones
- All outbound logged for visibility

### Log Shipping

All firewall traffic logs ship to Graylog:
- Transport: Syslog TCP
- Retention: 90 days
- Dashboard: Real-time traffic analysis

## Network Monitoring

### UniFi Controller

Manages all network hardware:
- UniFi Gateway
- 24-port managed switch
- 2 access points (WiFi 6)

**Monitoring features:**
- Real-time client list
- Bandwidth per device
- DPI (Deep Packet Inspection) stats

### Pi.Alert Network Scanner

Scans subnets every 5 minutes for:
- New device detection
- MAC address tracking
- Port scanning

## Lessons Learned

### 1. Multi-Tier DNS Saves the Day

When Pi-hole crashed due to database pressure, the firewall's static entries kept core infrastructure resolving. Without this layer, Proxmox nodes couldn't reach each other.

### 2. Config Drift Kills HA

The Caddy HA pair once drifted out of sync when I updated only one node. The VIP failed over to the outdated node, breaking several services. **Always deploy to BOTH nodes.**

### 3. VRRP ID Collisions

Each HA pair needs a unique VRRP ID. When I accidentally reused ID 55 for both DNS and NFS, one pair's failover broke the other. Now I track IDs in documentation.

### 4. Health Checks Need Redundancy

Early Pi-hole health checks tested only one upstream. If that upstream was slow, the check failed and triggered unnecessary failover. Now checks test multiple targets with fallback.

## Related Pages

- [Virtualization](/wiki/virtualization/) - Where DNS and proxy containers run
- [Monitoring](/wiki/monitoring/) - Log shipping and alerting
- [Automation](/wiki/automation/) - Network automation via Semaphore
