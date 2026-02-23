---
title: "Security"
description: "Next-gen firewall, XDR, certificates, and threat detection"
tags: ["wiki"]
topics: ["security", "panos", "wazuh", "firewall", "certificates"]
---

![Security Architecture](../../images/banner-security.png)

Enterprise security principles applied to a homelab. This wiki covers the layered security architecture — from next-gen firewall policies to XDR threat detection to certificate lifecycle automation.

## Firewall Architecture

The Palo Alto Networks PA-440 provides the network security foundation with App-ID, zone-based policies, and centralized logging. Full details in the [Networking](../networking/#firewall-architecture) wiki — including security zones, VLAN trust levels, and DNS proxy configuration.

## Wazuh XDR

Open-source extended detection and response (XDR) monitoring endpoints and containers across the homelab:

- [Wazuh XDR Implementation Journal]({{< relref "/posts/2026/wazuh-xdr-implementation-journal" >}}) — Full deployment walkthrough: manager setup, agent enrollment, Graylog integration
- [Wazuh + Graylog Integration]({{< relref "/posts/2026/wazuh-xdr-graylog-integration" >}}) — Shipping Wazuh alerts to Graylog for unified log analysis

## Certificate Management

Automated certificate lifecycle for PAN-OS SSL decryption:

- [PAN-OS Certificate Consolidation]({{< relref "/posts/2026/panos-cert-consolidation" >}}) — Architecture for unified certificate management across firewall and reverse proxy
- [Chainguard Root Store Automation]({{< relref "/posts/2026/panos-chainguard-root-store-automation" >}}) — Automated root CA updates via Semaphore + Ansible

## Vaultwarden Security

Self-hosted password management with dual-path traffic architecture:

- [Vaultwarden Traffic Flow & IP Header Strategy](vaultwarden-traffic-flow/) — Unified IP headers across Cloudflare Tunnel and Caddy reverse proxy paths

## Related Pages

- [Networking](../networking/) - Firewall zones, VLANs, reverse proxy
- [Observability](../observability/) - Security log analysis in Graylog
- [Automation](../automation/) - Certificate automation via Semaphore
