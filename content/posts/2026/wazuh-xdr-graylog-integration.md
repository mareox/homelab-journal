---
title: "Deploying Wazuh XDR with Graylog Integration"
date: 2026-02-03
tags: ["lesson-learned", "lab-note"]
topics: ["security", "wazuh", "graylog", "monitoring", "docker"]
difficulties: ["intermediate"]
cover:
  image: "images/posts/2026/wazuh-xdr-graylog-integration.png"
  alt: "Wazuh XDR and Graylog SIEM Integration Architecture"
  caption: "Security monitoring pipeline: endpoints to Wazuh XDR to Graylog SIEM"
---

## The Challenge

I needed a unified security monitoring solution that could:
1. Provide endpoint detection and response (XDR) capabilities
2. Integrate with my existing Graylog centralized logging infrastructure
3. Scale from a single-node deployment to multi-node if needed
4. Work with my existing OpenClaw threat intelligence feeds

## The Solution

### Wazuh Single-Node Stack

Deployed Wazuh as a Docker-based single-node stack. The single-node architecture includes:
- **Wazuh Manager**: Core HIDS/XDR engine
- **Wazuh Indexer**: OpenSearch-based storage
- **Wazuh Dashboard**: Kibana-based UI

### Graylog Integration via Rsyslog

Rather than replacing Graylog, I integrated Wazuh alerts into my existing logging pipeline:

```bash
# /etc/rsyslog.d/wazuh-graylog.conf
# Forward Wazuh alerts to Graylog via syslog
module(load="imfile")

input(type="imfile"
      File="/var/ossec/logs/alerts/alerts.json"
      Tag="wazuh-alerts"
      Severity="info"
      Facility="local0")

local0.* @@<GRAYLOG_SERVER>:1514;RSYSLOG_SyslogProtocol23Format
```

### Pipeline Creation Scripts

Created Python scripts to automate Graylog configuration:

**Pipeline Creator** - Sets up extractors and processing rules for Wazuh JSON:
```python
# Key fields extracted:
# - rule.level (severity 0-15)
# - rule.description (alert message)
# - agent.name (source host)
# - data.* (event-specific data)
```

**Dashboard Creator** - Generates Graylog dashboards with:
- Alert severity distribution (pie chart)
- Top 10 triggered rules (bar chart)
- Agent activity timeline (histogram)
- Critical alerts table (>= level 10)

## What I Learned

### 1. JSON Log Shipping is Tricky

Wazuh writes alerts as JSON Lines format, but rsyslog's `imfile` module treats each line as a message. This works well for Graylog's JSON extractor, but you need to ensure:
- File permissions allow rsyslog to read the alerts file
- Log rotation doesn't break the file watcher

### 2. OpenClaw Integration Adds Value

Custom rules referencing OpenClaw threat feeds (`openclaw_rules.xml`) provide:
- Known malicious IP detection
- Suspicious domain lookups
- File hash matching against threat intel

### 3. Single-Node is Fine for Homelab

The three-container stack (manager, indexer, dashboard) runs comfortably on:
- 4 vCPUs
- 8GB RAM
- 50GB storage

For a homelab with <20 agents, this is more than sufficient.

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Security Monitoring                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                 │
│  │ Agents  │───▶│ Wazuh   │───▶│ Wazuh   │                 │
│  │ (hosts) │    │ Manager │    │ Indexer │                 │
│  └─────────┘    └────┬────┘    └─────────┘                 │
│                      │                                      │
│                      │ alerts.json                          │
│                      ▼                                      │
│               ┌──────────────┐                              │
│               │   rsyslog    │                              │
│               └──────┬───────┘                              │
│                      │ syslog/tcp:1514                      │
│                      ▼                                      │
│               ┌──────────────┐                              │
│               │   Graylog    │◀── Unified Log View          │
│               └──────────────┘                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Files Created

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Wazuh single-node stack |
| `rsyslog-graylog-wazuh.conf` | Syslog forwarding config |
| `openclaw_rules.xml` | Custom threat intel rules |
| `create-wazuh-graylog-pipeline.py` | Graylog pipeline automation |
| `create-wazuh-dashboard.py` | Dashboard generation |

## Next Steps

1. Deploy Wazuh agents to all LXC containers
2. Create alerting rules in Graylog for critical Wazuh events
3. Integrate with Discord notifications for real-time alerts
4. Explore Wazuh's vulnerability detection module

---

**Takeaway:** Wazuh provides enterprise-grade XDR capabilities that integrate well with existing logging infrastructure. The rsyslog bridge to Graylog gives you the best of both worlds - specialized security analytics in Wazuh and unified log correlation in Graylog.
