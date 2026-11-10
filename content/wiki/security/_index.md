---
title: "Security"
description: "Next-gen firewall, XDR, certificates, and threat detection"
tags: ["wiki"]
topics: ["security", "panos", "wazuh", "firewall", "certificates"]
---

![A firewall policy review with allow and deny examples](../../images/banner-security.png)

I use the lab to apply the same security principles I'd use in an enterprise. That includes next-generation firewall policies, XDR threat detection, and automated certificate management.

## Firewall Architecture

I use the Palo Alto Networks PA-440 for App-ID, zone-based policies, and centralized logging. The [Networking]({{< relref "/wiki/networking#security-boundaries" >}}) wiki covers security zones, VLAN trust levels, and DNS proxy configuration.

## Wazuh XDR

Wazuh is the open-source extended detection and response (XDR) tool I use to monitor endpoints and containers across the lab.

- [Wazuh XDR Implementation Journal]({{< relref "/posts/2026/wazuh-xdr-implementation-journal" >}}) covers manager setup, agent enrollment, and Graylog integration.
- [Wazuh + Graylog Integration]({{< relref "/posts/2026/wazuh-xdr-graylog-integration" >}}) explains how I send Wazuh alerts to Graylog so I can analyze logs in one place.

## Certificate Management

I automate certificate management for PAN-OS SSL decryption.

- [PAN-OS Certificate Consolidation]({{< relref "/posts/2026/panos-cert-consolidation" >}}) explains how the firewall and reverse proxy share a certificate management workflow.
- [Chainguard Root Store Automation]({{< relref "/posts/2026/panos-chainguard-root-store-automation" >}}) shows how Semaphore and Ansible automate root CA updates.

## Vaultwarden Security

I self-host Vaultwarden and route traffic to it in two ways.

- [Vaultwarden Traffic Flow & IP Header Strategy](vaultwarden-traffic-flow/) explains how both the Cloudflare Tunnel and Caddy reverse proxy paths use the same client IP header.

## Related Pages

- [Networking](../networking/) - Firewall zones, VLANs, reverse proxy
- [Observability](../observability/) - Security log analysis in Graylog
- [Automation](../automation/) - Certificate automation via Semaphore
