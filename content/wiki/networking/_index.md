---
title: "Networking"
description: "VLANs, high-availability DNS, firewalls, and reverse proxy architecture"
tags: ["wiki"]
topics: ["networking", "dns", "firewall", "vlan", "caddy"]
cover:
  image: "/images/banner-networking.png"
  alt: "Network architecture diagram"
  relative: false
---

My homelab network is segmented into **5 VLANs** with a multi-tier DNS architecture and high-availability reverse proxy. This wiki covers the design decisions and implementation details.

## Complete Network Topology

{{< mermaid >}}
flowchart TB
    subgraph INTERNET["☁️ INTERNET"]
        ISP[("🌐 ISP<br/>Cable Modem")]
        CF["🛡️ Cloudflare<br/>DDoS + CDN + Access"]
    end

    subgraph EDGE["🔥 SECURITY EDGE"]
        direction TB
        PAFW["<b>PA-440 NGFW</b><br/>━━━━━━━━━━━━━━━<br/>🔍 App-ID Inspection<br/>🌐 DNS Proxy + Cache<br/>📋 DHCP Server<br/>📊 Traffic Logging"]
        CFTUNNEL["☁️ CF Tunnel Agent<br/>Zero-Trust Access"]
    end

    subgraph SWITCHING["🔀 NETWORK FABRIC"]
        UNIFI_GW["🚪 UniFi Gateway<br/>Inter-VLAN Routing"]
        UNIFI_SW["📡 USW-24-G2<br/>24-Port Managed"]
        UNIFI_AP1["📶 U6-LR<br/>WiFi 6 AP"]
        UNIFI_AP2["📶 U6-Pro<br/>WiFi 6 AP"]
    end

    subgraph VLAN10["🔒 VLAN 10 • MANAGEMENT<br/>192.168.10.0/24"]
        direction TB
        NAS1[("💾 NAS-Primary<br/>DS920+")]
        NAS2[("💾 NAS-Secondary<br/>DS719")]
        DNS_HA["🌐 Pi-hole HA<br/>━━━━━━━━━━━<br/>DNS-1 (Pri)<br/>DNS-2 (Sec)<br/>VIP: .110"]
        KVM["🖥️ TinyPilot KVM<br/>Remote Console"]
    end

    subgraph VLAN30["⚙️ VLAN 30 • SERVERS<br/>192.168.30.0/24"]
        direction TB

        subgraph PVE["PROXMOX CLUSTER"]
            PVE2["📦 Node-2<br/>LVM-thin"]
            PVE3["📦 Node-3<br/>ZFS"]
            PVE5["📦 Node-5<br/>LVM-thin"]
            PVE6["📦 Node-6<br/>ZFS"]
        end

        subgraph SERVICES["CORE SERVICES"]
            CADDY_HA["🔀 Caddy HA<br/>Reverse Proxy<br/>VIP: .161"]
            GRAYLOG["📊 Graylog<br/>Log Server"]
            N8N["⚡ n8n<br/>Automation"]
            SEMA["🎯 Semaphore<br/>Ansible CI/CD"]
        end

        subgraph APPS["APPLICATIONS"]
            VAULT["🔐 Vaultwarden"]
            HASS["🏠 Home Assistant"]
            HOMARR["📱 Homarr"]
            UTK["📈 Uptime Kuma x2"]
        end
    end

    subgraph VLAN40["🔸 VLAN 40 • ISOLATED<br/>172.30.40.0/24"]
        ISO_DNS["🌐 DNS-40"]
        ISO_SVC["🔒 Isolated Services"]
    end

    subgraph VLAN50["📱 VLAN 50 • IoT<br/>172.30.50.0/24"]
        IOT_DNS["🌐 DNS-50"]
        IOT_DEV["📱 Smart Devices"]
    end

    %% External Connections
    ISP ====> PAFW
    CF -.->|"Authenticated<br/>Traffic"| CFTUNNEL

    %% Edge to Fabric
    PAFW ==> UNIFI_GW
    CFTUNNEL --> PAFW

    %% Switching Fabric
    UNIFI_GW --> UNIFI_SW
    UNIFI_SW --> UNIFI_AP1 & UNIFI_AP2

    %% VLAN Connections
    UNIFI_SW -->|"Trunk"| VLAN10
    UNIFI_SW -->|"Trunk"| VLAN30
    UNIFI_SW -->|"Trunk"| VLAN40
    UNIFI_SW -->|"Trunk"| VLAN50

    %% Styling
    classDef internet fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef edge fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef switching fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px
    classDef mgmt fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef servers fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef isolated fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef iot fill:#e0f2f1,stroke:#004d40,stroke-width:2px

    class ISP,CF internet
    class PAFW,CFTUNNEL edge
    class UNIFI_GW,UNIFI_SW,UNIFI_AP1,UNIFI_AP2 switching
    class NAS1,NAS2,DNS_HA,KVM mgmt
    class PVE2,PVE3,PVE5,PVE6,CADDY_HA,GRAYLOG,N8N,SEMA,VAULT,HASS,HOMARR,UTK servers
    class ISO_DNS,ISO_SVC isolated
    class IOT_DNS,IOT_DEV iot
{{< /mermaid >}}

## VLAN Design

| VLAN | Subnet | Purpose | Key Services | Security Level |
|------|--------|---------|--------------|----------------|
| **10** | 192.168.10.0/24 | Management & Core | NAS, DNS HA, KVM devices | 🔒 High |
| **30** | 192.168.30.0/24 | Server Network | Proxmox, Docker, Apps | ⚙️ Medium |
| **40** | 172.30.40.0/24 | Isolated Services | Restricted access | 🔸 Low |
| **50** | 172.30.50.0/24 | IoT Devices | Smart home | 📱 Minimal |
| **254** | 10.254.254.0/24 | Firewall Management | Out-of-band mgmt | 🔐 Critical |

**Design principle:** Servers (VLAN 30) can reach management (VLAN 10), but management devices are protected from server-initiated connections. IoT devices are fully isolated—they cannot initiate connections to any other VLAN.

## DNS Architecture

### Multi-Tier Design

The DNS stack uses a **three-tier architecture** for performance, redundancy, and ad-blocking:

{{< mermaid >}}
flowchart LR
    subgraph CLIENTS["👥 CLIENTS"]
        C1["💻 Workstation"]
        C2["📱 Mobile"]
        C3["🖥️ Server"]
    end

    subgraph TIER1["TIER 1: FIREWALL DNS PROXY"]
        FW["🔥 PA-440<br/>━━━━━━━━━━━━━━━<br/>⚡ <5ms Static Entries<br/>💨 <10ms Cached<br/>🔀 Smart Routing"]
    end

    subgraph TIER2["TIER 2: Pi-hole HA"]
        direction TB
        VIP(("🎯 VIP<br/>.110"))
        DNS1["🟢 DNS-Primary<br/>Priority 200<br/>MASTER"]
        DNS2["🟡 DNS-Secondary<br/>Priority 100<br/>BACKUP"]

        VIP -.-> DNS1
        VIP -.-> DNS2
    end

    subgraph TIER3["TIER 3: UPSTREAM"]
        CF_DNS["☁️ Cloudflare<br/>1.1.1.1"]
    end

    C1 & C2 & C3 --> FW
    FW -->|"*.local domains"| VIP
    FW -->|"External queries"| CF_DNS
    DNS1 & DNS2 --> CF_DNS

    classDef client fill:#e3f2fd,stroke:#1565c0
    classDef firewall fill:#ffebee,stroke:#c62828
    classDef pihole fill:#e8f5e9,stroke:#2e7d32
    classDef upstream fill:#fff8e1,stroke:#f57f17

    class C1,C2,C3 client
    class FW firewall
    class VIP,DNS1,DNS2 pihole
    class CF_DNS upstream
{{< /mermaid >}}

### DNS Performance Tiers

| Query Type | Response Time | Path |
|------------|---------------|------|
| 🚀 Firewall static entry | **<5ms** | Direct from PA-440 cache |
| ⚡ Firewall cached | **<10ms** | PA-440 → cached response |
| 💨 Pi-hole cached | **10-30ms** | PA-440 → Pi-hole → cached |
| 🌐 Uncached (full lookup) | **50-150ms** | Full DNS resolution chain |

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

## High-Availability Architecture

Three critical services run as HA pairs using keepalived VRRP:

{{< mermaid >}}
flowchart TB
    subgraph DNS_HA["🌐 DNS HIGH AVAILABILITY"]
        direction LR
        DNS_P["🟢 Pi-hole Primary<br/>Priority: 200<br/>VRRP ID: 55"]
        DNS_VIP(("VIP<br/>.110"))
        DNS_S["🟡 Pi-hole Secondary<br/>Priority: 100<br/>VRRP ID: 55"]
        DNS_P <--->|"VRRP"| DNS_VIP
        DNS_S <--->|"VRRP"| DNS_VIP
    end

    subgraph CADDY_HA["🔀 REVERSE PROXY HIGH AVAILABILITY"]
        direction LR
        CADDY_P["🟢 Caddy Primary<br/>Priority: 200<br/>VRRP ID: 61"]
        CADDY_VIP(("VIP<br/>.161"))
        CADDY_S["🟡 Caddy Secondary<br/>Priority: 100<br/>VRRP ID: 61"]
        CADDY_P <--->|"VRRP"| CADDY_VIP
        CADDY_S <--->|"VRRP"| CADDY_VIP
    end

    subgraph NFS_HA["💾 CERTIFICATE STORAGE HIGH AVAILABILITY"]
        direction LR
        NFS_P["🟢 NFS Primary<br/>Priority: 200<br/>VRRP ID: 65"]
        NFS_VIP(("VIP<br/>.165"))
        NFS_S["🟡 NFS Secondary<br/>Priority: 100<br/>VRRP ID: 65"]
        NFS_P <--->|"VRRP"| NFS_VIP
        NFS_S <--->|"VRRP"| NFS_VIP
        NFS_P <-->|"rsync<br/>Daily"| NFS_S
    end

    CADDY_P & CADDY_S -->|"Mount Certs"| NFS_VIP

    classDef primary fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    classDef secondary fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef vip fill:#bbdefb,stroke:#1565c0,stroke-width:3px

    class DNS_P,CADDY_P,NFS_P primary
    class DNS_S,CADDY_S,NFS_S secondary
    class DNS_VIP,CADDY_VIP,NFS_VIP vip
{{< /mermaid >}}

| Service | Primary | Secondary | VIP | VRRP ID | Failover Time |
|---------|---------|-----------|-----|---------|---------------|
| **DNS** | Pi-hole 1 | Pi-hole 2 | .110 | 55 | ~15 seconds |
| **Reverse Proxy** | Caddy 1 | Caddy 2 | .161 | 61 | ~10 seconds |
| **Cert Storage** | NFS 1 | NFS 2 | .165 | 65 | ~10 seconds |

**Key settings:**
- Preemption: Enabled (primary reclaims VIP on recovery)
- Notifications: Discord webhooks on state changes
- Health checks: Service-specific validation before accepting traffic

## Reverse Proxy Architecture

### Dual-Proxy Design

{{< mermaid >}}
flowchart TB
    subgraph EXTERNAL["🌐 EXTERNAL ACCESS"]
        USER["👤 Remote User"]
        CF["☁️ Cloudflare<br/>Access + WAF"]
    end

    subgraph INTERNAL["🏠 INTERNAL ACCESS"]
        LAN_USER["👤 LAN User"]
    end

    subgraph TUNNEL["🔒 CLOUDFLARE TUNNEL PATH"]
        CFTUNNEL["CF Tunnel Agent<br/>Zero exposed ports"]
    end

    subgraph CADDY["🔀 CADDY HA PATH"]
        CADDY_VIP(("Caddy VIP<br/>.161"))
    end

    subgraph BACKENDS["⚙️ BACKEND SERVICES"]
        SVC1["🔐 Vaultwarden"]
        SVC2["📊 Graylog"]
        SVC3["🏠 Home Assistant"]
        SVC4["📱 Homarr"]
    end

    USER -->|"HTTPS"| CF
    CF -->|"Authenticated"| CFTUNNEL
    CFTUNNEL --> SVC1

    LAN_USER -->|"HTTPS"| CADDY_VIP
    CADDY_VIP --> SVC1 & SVC2 & SVC3 & SVC4

    classDef external fill:#e3f2fd,stroke:#1565c0
    classDef internal fill:#e8f5e9,stroke:#2e7d32
    classDef tunnel fill:#fff3e0,stroke:#e65100
    classDef caddy fill:#f3e5f5,stroke:#6a1b9a
    classDef backend fill:#fafafa,stroke:#616161

    class USER,CF external
    class LAN_USER internal
    class CFTUNNEL tunnel
    class CADDY_VIP caddy
    class SVC1,SVC2,SVC3,SVC4 backend
{{< /mermaid >}}

| Proxy | Purpose | Auth | Use Case |
|-------|---------|------|----------|
| **Cloudflare Tunnel** | External access | Cloudflare Access | Public-facing services |
| **Caddy HA** | Internal + direct external | None (service-level) | Internal services, high-throughput |

### Cloudflare Tunnel Path

**Benefits:**
- Zero exposed firewall ports (outbound-only)
- DDoS protection included
- User identity via Cloudflare Access
- Automatic TLS termination

**Protected services:** Password manager, VPN management, media server.

### Caddy HA Path

**Benefits:**
- No external dependency
- Lower latency for internal traffic
- Full control over TLS certificates
- Wildcard cert via DNS-01 challenge

### Domain Tiers

| Pattern | Example | Purpose | TLS |
|---------|---------|---------|-----|
| `*.local` | `service.homelab.local` | Direct backend access | None |
| `*.loc.domain.com` | `service.loc.domain.com` | Internal TLS | Wildcard cert |
| `*.domain.com` | `service.domain.com` | External via Cloudflare | Cloudflare |

## Firewall Architecture

### Palo Alto Networks PA-440

{{< mermaid >}}
flowchart LR
    subgraph ZONES["SECURITY ZONES"]
        UNTRUST["🌐 UNTRUST<br/>Internet"]
        LAN10["🔒 L3-LAN10<br/>Management"]
        INFRA["⚙️ L3-INFRA<br/>Servers"]
        ISO["🔸 L3-ISOLATED<br/>IoT + Restricted"]
    end

    subgraph FEATURES["PA-440 FEATURES"]
        APPID["🔍 App-ID"]
        DNS_PROXY["🌐 DNS Proxy"]
        DHCP["📋 DHCP Server"]
        NAT["🔀 NAT"]
        LOG["📊 Logging"]
    end

    UNTRUST -->|"Inspect"| APPID
    APPID --> LAN10 & INFRA
    INFRA -->|"Allowed"| LAN10
    ISO -->|"Blocked"| LAN10 & INFRA

    classDef untrust fill:#ffebee,stroke:#c62828
    classDef mgmt fill:#e8f5e9,stroke:#2e7d32
    classDef servers fill:#fff3e0,stroke:#e65100
    classDef isolated fill:#fce4ec,stroke:#880e4f

    class UNTRUST untrust
    class LAN10 mgmt
    class INFRA servers
    class ISO isolated
{{< /mermaid >}}

| Feature | Usage |
|---------|-------|
| **App-ID** | Application-aware traffic inspection |
| **DNS Proxy** | Intelligent caching and routing |
| **DHCP Server** | Centralized IP assignment for all VLANs |
| **NAT** | Destination/source translation for services |
| **Zone Security** | VLAN-based access policies |
| **Logging** | All traffic to Graylog via Syslog TCP |

### Security Zones

| Zone | VLANs | Trust Level | Outbound | Cross-Zone |
|------|-------|-------------|----------|------------|
| L3-LAN10 | 10 | 🔒 High | ✅ All | Protected |
| L3-INFRA | 30 | ⚙️ Medium | ✅ All | → LAN10 only |
| L3-ISOLATED | 40, 50 | 🔸 Low | ✅ Limited | ❌ Blocked |
| L3-UNTRUST | - | ❌ None | N/A | Inspect only |

## Network Monitoring

### UniFi Controller

Manages all network hardware:
- UniFi Gateway (inter-VLAN routing)
- 24-port managed switch (USW-24-G2)
- 2 WiFi 6 access points (U6-LR, U6-Pro)

**Monitoring features:**
- Real-time client list
- Bandwidth per device
- DPI (Deep Packet Inspection) stats
- Anomaly detection

### Pi.Alert Network Scanner

Scans subnets every 5 minutes for:
- New device detection
- MAC address tracking
- Port scanning
- Vendor lookup

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

- [Virtualization]({{< relref "/wiki/virtualization" >}}) - Where DNS and proxy containers run
- [Monitoring]({{< relref "/wiki/monitoring" >}}) - Log shipping and alerting
- [Automation]({{< relref "/wiki/automation" >}}) - Network automation via Semaphore
