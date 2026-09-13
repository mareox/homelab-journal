---
title: "Homelab Network Architecture"
description: "A segmented homelab network with redundant core services and role-based access boundaries."
date: 2026-09-12
tags: ["wiki"]
topics: ["networking", "firewall", "vlan", "reverse-proxy"]
---

![Network Architecture](../../images/banner-networking.png)

This homelab uses segmented networks, policy enforcement at the edge, and redundant services for the few components that would otherwise make a bad afternoon much worse.

## Architecture at a glance

The design separates management, infrastructure, isolated workloads, connected devices, and out-of-band administration. The firewall enforces the boundaries. Internal services use role-based names, and public access is mediated through an authenticated edge rather than direct exposure of individual workloads.

## Resilience model

Three core capabilities have redundant pairs:

| Capability | Design | Failure behavior |
|---|---|---|
| Name resolution | Two filtering resolvers with a floating service address | The secondary resolver takes over when the primary is unhealthy. |
| Internal ingress | Two reverse-proxy nodes with shared certificate storage | Requests continue through the surviving proxy. |
| Certificate storage | Replicated network storage | Proxy nodes retain access to the certificate data path. |

Health checks validate service availability before a node accepts traffic. Configuration changes to a redundant pair are deployed and verified on both members. One-sided updates are how a quiet configuration mismatch turns into an outage with stage lighting.

## Name resolution and ingress

Clients use a layered resolver path. Local service discovery remains available during a filtering-resolver failure, while external names are resolved through approved upstream providers.

Ingress has two purpose-built paths:

| Path | Use | Boundary |
|---|---|---|
| Authenticated tunnel | Remote access to selected services | Identity-aware access controls at the external edge. |
| Internal reverse proxy | LAN service access | TLS and routing stay within the private environment. |

## Security boundaries

The firewall provides application-aware policy enforcement, address assignment and name-resolution integration, network address translation where required, and centralized logging. Connected-device and isolated-workload networks cannot initiate arbitrary access to management or infrastructure services.

## Monitoring

The environment monitors name resolution, ingress, service reachability, and device discovery. Alerts are useful only when they identify the failed dependency and the owner who can fix it, which is less glamorous than blinking dashboards but substantially more useful.

## Public-information boundary

This page intentionally omits private addresses, internal hostnames, domain names, service ports, device inventories, and implementation-specific topology. Those facts belong in the private infrastructure repository and operational Wiki.

## Related Pages

- [Infrastructure]({{< relref "/wiki/infrastructure" >}}) - Platform overview
- [Observability]({{< relref "/wiki/observability" >}}) - Monitoring and logging
- [Automation]({{< relref "/wiki/automation" >}}) - Operations automation
