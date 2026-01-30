---
title: "Monitoring"
description: "Centralized logging with Graylog, uptime monitoring, alerting, and observability"
tags: ["wiki"]
topics: ["monitoring", "graylog", "logging", "alerting", "observability"]
cover:
  image: "/images/banner-monitoring.png"
  alt: "Observability stack diagram"
  relative: false
---

![Observability Stack](/homelab-journal/images/banner-monitoring.png)

Visibility into 50+ services requires centralized logging, proactive alerting, and dashboards. This wiki covers my monitoring stack and the patterns that make it work.

## Monitoring Stack

{{< mermaid >}}
graph TB
    subgraph "Log Sources"
        FW[Firewall Logs<br/>Syslog TCP]
        DNS[Pi-hole DNS<br/>Syslog UDP]
        DOCKER[Docker Containers<br/>GELF UDP]
        NAS[NAS Devices<br/>Syslog UDP]
    end

    subgraph "Log Pipeline"
        GRAYLOG[Graylog<br/>Ingest + Process]
        OPENSEARCH[OpenSearch<br/>Storage + Search]
        MONGODB[MongoDB<br/>Configuration]
    end

    subgraph "Visualization"
        DASH[Graylog Dashboards]
        PULSE[Pulse<br/>Proxmox Metrics]
        UTK[Uptime Kuma<br/>Availability]
    end

    subgraph "Alerting"
        DISCORD[Discord Webhooks]
    end

    FW & DNS & DOCKER & NAS --> GRAYLOG
    GRAYLOG --> OPENSEARCH
    GRAYLOG --> MONGODB
    GRAYLOG --> DASH
    DASH & PULSE & UTK --> DISCORD
{{< /mermaid >}}

## Graylog Centralized Logging

[Graylog](https://graylog.org) is my log aggregation platform—collecting, processing, and visualizing logs from across the homelab.

### Architecture

| Component | Purpose | Resources |
|-----------|---------|-----------|
| **Graylog** | Web UI + log ingestion | 1 GB JVM heap |
| **OpenSearch** | Log storage + full-text search | 1 GB JVM heap |
| **MongoDB** | Configuration metadata | ~200 MB |

**Storage**: Dedicated 240 GB disk for OpenSearch indices.

**Key insight**: JVM heap tuning matters. Leaving ~2 GB free for OS filesystem cache dramatically improves OpenSearch query performance.

### Log Shipping Methods

| Transport | Port | Use Case | Example |
|-----------|------|----------|---------|
| **Syslog TCP** | 1514 | Appliance native syslog | Firewall traffic logs |
| **Syslog UDP** | 1514 | rsyslog forwarding | Pi-hole DNS, NAS |
| **GELF UDP** | 12201 | Docker container logs | Caddy, other stacks |

### GELF Docker Pattern

Docker services ship logs directly to Graylog:

```yaml
services:
  myservice:
    logging:
      driver: gelf
      options:
        gelf-address: "udp://<GRAYLOG_IP>:12201"
        tag: "service-name"
```

**Benefits:**
- Structured log fields (container name, image, etc.)
- No log rotation management
- `docker logs` still works (Docker dual logging)

**Gotcha**: Changing logging driver requires `docker compose down && up -d`, not just restart.

### rsyslog Forwarding Pattern

![rsyslog Forwarding Flow](/homelab-journal/images/diagram-rsyslog-flow.png)

For services without native Graylog support, rsyslog forwards logs:

{{< mermaid >}}
flowchart TB
    APP["📄 Application Log<br/>/var/log/app.log"]
    IMFILE["📥 rsyslog imfile<br/>(file input)"]
    OMFWD["📤 rsyslog omfwd<br/>(UDP 1514)"]

    APP -->|"Tail log file"| IMFILE
    IMFILE -->|"Forward to Graylog"| OMFWD

    classDef source fill:#e3f2fd,stroke:#1565c0
    classDef process fill:#fff3e0,stroke:#e65100
    classDef output fill:#e8f5e9,stroke:#2e7d32

    class APP source
    class IMFILE process
    class OMFWD output
{{< /mermaid >}}

**Example**: Pi-hole DNS logs → rsyslog → Graylog → Dashboard.

### Active Pipelines

Each log source has a processing pipeline that extracts structured fields:

| Stream | Source | Field Prefix | Dashboards |
|--------|--------|--------------|------------|
| Pi-hole DNS | DNS servers | `dns_` | Query analysis, blocked domains |
| PAN-OS Firewall | Main firewall | `fw_` | Traffic, threats, blocked activity |
| Synology NAS | NAS devices | `syn_` | Storage, access logs |
| Caddy Proxy | Reverse proxy | `caddy_` | Request analysis |
| Internet Modem | Upstream modem | `modem_` | Connection logs |

### Pipeline Design Pattern

All pipelines use a **single-stage pattern**:

{{< mermaid >}}
flowchart TB
    STAGE["Stage 0<br/>(match either)"]
    R1["Rule 1: Parse field A"]
    R2["Rule 2: Parse field B"]
    R3["Rule 3: Parse field C"]
    CATCH["Catch-all: Tag unmatched"]

    STAGE --> R1
    STAGE --> R2
    STAGE --> R3
    STAGE --> CATCH

    classDef stage fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef rule fill:#fff3e0,stroke:#e65100
    classDef catchall fill:#ffebee,stroke:#c62828

    class STAGE stage
    class R1,R2,R3 rule
    class CATCH catchall
{{< /mermaid >}}

**Why single stage?** Graylog has a bug where `match either` in stage 0 prevents stage 1 from executing when no rules match. Single-stage with content-based exclusions avoids this.

### Index Retention

All index sets use standardized retention:

| Setting | Value |
|---------|-------|
| Min Lifetime | 30 days |
| Max Lifetime | 90 days |
| Strategy | Time-based with size optimization |
| Deletion | Automatic after max lifetime |

**Rationale**: 30-90 days covers most troubleshooting needs. Older logs rarely needed; if they are, PBS backups have the original sources.

## Dashboards

### Graylog Dashboards

13 dashboards organized by function:

| Category | Dashboards | Purpose |
|----------|------------|---------|
| **DNS** | Pi-hole Overview, DNS Security, DNS Operations | Query analysis, blocked domains |
| **Firewall** | Traffic, Threats, Blocked, URLs, Network Activity | Security visibility |
| **Infrastructure** | Homelab Security Overview | Cross-service summary |
| **Proxy** | Caddy Overview | Request analysis |

**Dashboard creation**: Python scripts using the Graylog REST API create dashboards programmatically. This enables version control and reproducible deployments.

### Pulse (Proxmox Monitoring)

[Pulse](https://github.com/relliky/proxmox-pulse) provides Proxmox-specific metrics:

| Metric | Visualization |
|--------|---------------|
| CPU usage (per node) | Time series graph |
| RAM usage (per node) | Time series graph |
| Disk usage | Bar charts |
| Network I/O | Time series graph |
| VM/LXC status | Status cards |

**Integration**: Read-only Proxmox API user (`pulse@pve` with PVEAuditor role).

## Uptime Monitoring

### Uptime Kuma

Two Uptime Kuma instances for redundant availability monitoring:

| Instance | Purpose |
|----------|---------|
| UTK-A | Primary monitoring |
| UTK-B | Secondary (monitors UTK-A too) |

**Why two?** If UTK-A goes down, UTK-B notices and alerts. Single instance = blind spot.

### Monitor Types

| Type | Use Case | Example |
|------|----------|---------|
| **HTTP(S)** | Web services | Graylog UI, Proxmox API |
| **TCP Port** | Raw connectivity | SSH, database ports |
| **Ping** | Basic availability | Network devices |
| **DNS** | Resolution check | Pi-hole health |

### Monitor Strategy

{{< mermaid >}}
flowchart TB
    subgraph CRITICAL["🔴 Critical Services (1 min interval)"]
        C1["DNS VIP"]
        C2["Reverse Proxy VIP"]
        C3["Main Firewall"]
        C4["NAS devices"]
    end

    subgraph STANDARD["🟡 Standard Services (5 min interval)"]
        S1["All web UIs"]
        S2["API endpoints"]
        S3["Docker hosts"]
    end

    subgraph LOW["🟢 Low Priority (15 min interval)"]
        L1["Development containers"]
    end

    classDef critical fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef standard fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef low fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px

    class CRITICAL critical
    class STANDARD standard
    class LOW low
{{< /mermaid >}}

## Alerting

### Discord Integration

All monitoring sends alerts to Discord:

{{< mermaid >}}
flowchart TB
    subgraph ALERT["🔴 Service Down"]
        direction TB
        INFO["<b>Service:</b> DNS Primary<br/><b>Status:</b> DOWN<br/><b>Duration:</b> 2m 15s<br/><b>Last Check:</b> 10:42:15 AM"]
        LINK["🔗 View Dashboard"]
    end

    classDef alert fill:#ffebee,stroke:#c62828,stroke-width:2px
    class ALERT alert
{{< /mermaid >}}

### Alert Sources

| Source | Alert Types |
|--------|-------------|
| **Uptime Kuma** | Service down/up, certificate expiry |
| **Graylog** | Log-based alerts (high error rate, security events) |
| **Keepalived** | HA failover notifications |
| **Watchtower** | Container updates |
| **Backup scripts** | Backup success/failure |

### Alert Fatigue Prevention

**Strategies to avoid noise:**

1. **Severity tiers**: Only critical alerts wake me up
2. **Cooldown periods**: 30-minute minimum between repeat alerts
3. **Flap detection**: Ignore rapid up/down cycles (usually transient)
4. **Maintenance windows**: Suppress alerts during planned work

## Network Discovery

### Pi.Alert

Scans subnets every 5 minutes for device discovery:

| Feature | Purpose |
|---------|---------|
| New device detection | Alert on unknown devices |
| MAC tracking | Identify device moves |
| Port scanning | Discover services |
| Vendor lookup | Identify device types |

**Monitored subnets**: Management VLAN, Server VLAN.

## Observability Patterns

### Log-Based Monitoring

```
Application → Graylog → Stream → Alert Condition → Discord
```

**Example**: "More than 10 DNS query failures in 5 minutes" → Alert.

### Metric-Based Monitoring

```
Service → Prometheus/API → Pulse/Dashboard → Threshold → Alert
```

**Example**: "Proxmox node CPU > 90% for 5 minutes" → Alert.

### Synthetic Monitoring

```
Uptime Kuma → Scheduled Request → Service → Response Check → Alert
```

**Example**: "Graylog /api/system/lbstatus doesn't return ALIVE" → Alert.

## Lessons Learned

### 1. JVM Heap Pinning

Graylog and OpenSearch both run on JVMs. Without explicit heap limits, they compete for RAM and starve the OS filesystem cache. **Always pin JVM heap:**

```yaml
GRAYLOG_SERVER_JAVA_OPTS: "-Xms1g -Xmx1g"
OPENSEARCH_JAVA_OPTS: "-Xms1g -Xmx1g"
```

### 2. Graylog 7 API Gotchas

Graylog 7 changed its REST API significantly:

| Issue | Solution |
|-------|----------|
| `entity cannot be null` | Wrap body in `{"entity": <payload>}` |
| Regex capture groups | 0-indexed: `m["0"]` = first group |
| Stream creation | Requires explicit `index_set_id` |
| Dashboard series format | Use search_type format, not widget format |

### 3. Log Retention Balance

Too short = missing data when you need it.
Too long = disk full, slow queries.

30-90 days is the sweet spot for homelab scale.

### 4. Redundant Monitoring

The monitoring system itself needs monitoring. UTK-B watching UTK-A ensures no blind spots.

### 5. Pipeline Rules Only Apply at Ingestion

Graylog pipeline rules process messages **at ingestion time only**. Changing a rule doesn't reprocess existing logs. For historical data, you must re-send the logs or query raw fields.

## Quick Reference

### Graylog API

```bash
# Health check
curl http://<GRAYLOG_IP>:9000/api/system/lbstatus

# List streams
curl -u admin:<PASSWORD> http://<GRAYLOG_IP>:9000/api/streams

# Search logs
curl -u admin:<PASSWORD> "http://<GRAYLOG_IP>:9000/api/views/search/messages?query=source:firewall"
```

### Log Shipping Test

```bash
# Test syslog UDP
echo "<14>Test message from $(hostname)" | nc -u <GRAYLOG_IP> 1514

# Test GELF
echo '{"short_message":"Test","host":"test"}' | nc -u <GRAYLOG_IP> 12201
```

## Related Pages

- [Networking]({{< relref "/wiki/networking" >}}) - Log sources (firewall, DNS)
- [Virtualization]({{< relref "/wiki/virtualization" >}}) - Where monitoring runs
- [Automation]({{< relref "/wiki/automation" >}}) - Alert automation
