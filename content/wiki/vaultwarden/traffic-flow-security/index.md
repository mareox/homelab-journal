---
title: "Architecture: Vaultwarden Traffic Flow & IP Header Strategy"
date: 2026-01-31
tags: ["architecture", "security", "cloudflare", "reverse-proxy"]
topics: ["vaultwarden", "cloudflare-tunnel", "caddy"]
cover:
  image: "thumbnail.png"
  alt: "Security shield with padlock protecting server infrastructure"
---

## Overview

When running a self-hosted password manager like Vaultwarden, accurate client IP logging is critical for security alerts. The "New Device Login" email should show the actual IP address of whoever just accessed your vault—not your reverse proxy's internal IP.

This becomes tricky when you have multiple traffic paths: external users coming through Cloudflare Tunnel, and internal users coming through your local reverse proxy. Each path uses different mechanisms to communicate the real client IP.

This post documents the architecture I use to solve this: **unified IP headers across both traffic paths**.

## The Problem

After migrating Vaultwarden's external access from Cloudflare Proxy (orange cloud DNS) to Cloudflare Tunnel with direct backend routing, my "New Device Login" alerts started showing the tunnel container's IP instead of the real client IP.

**Before (broken):**
```text
New device logged in:
  IP: <TUNNEL_IP>  ← Wrong! This is my tunnel container
  Device: Chrome on Windows
```

**After (fixed):**
```text
New device logged in:
  IP: 203.0.113.50  ← Correct! Real public IP
  Device: Chrome on Windows
```

## Architecture

I use a dual-path architecture where external and internal traffic take completely different routes:

{{< mermaid >}}
flowchart TD
    subgraph External["External Access (Internet)"]
        User1([External User])
        CF[Cloudflare Edge]
        CFT[CF Tunnel]
    end

    subgraph Internal["Internal Access (LAN)"]
        User2([Internal User])
        Caddy[Caddy HA]
    end

    subgraph Backend["Backend Service"]
        VW[(Vaultwarden)]
    end

    User1 -->|HTTPS| CF
    CF -->|"Sets CF-Connecting-IP"| CFT
    CFT -->|"Direct route"| VW

    User2 -->|HTTPS| Caddy
    Caddy -->|"Sets CF-Connecting-IP"| VW
{{< /mermaid >}}

### Why Direct Tunnel Routing?

The key design decision: **CF Tunnel routes directly to Vaultwarden, bypassing Caddy**.

Why?

1. **Resilience**: Password manager is critical infrastructure. If Caddy has issues (NFS mount failure, configuration drift, etc.), Vaultwarden stays accessible externally.

2. **Fewer dependencies**: Each additional component in the chain is a potential failure point.

3. **Performance**: One less network hop for external requests.

The trade-off is complexity in IP header handling, which this architecture solves.

## The IP Header Strategy

### The Challenge

| Traffic Path | Header Source | Original Header |
|--------------|---------------|-----------------|
| External (CF Tunnel) | Cloudflare Edge | `CF-Connecting-IP` |
| Internal (Caddy) | Caddy | `X-Real-IP` |

Vaultwarden only reads **one** header name via its `IP_HEADER` environment variable. Two different headers = inconsistent IP logging.

### The Solution

**Standardize on `CF-Connecting-IP` for both paths.**

External traffic already has this header set by Cloudflare. For internal traffic, configure Caddy to set the same header:

```caddy
vault.loc.<YOUR_DOMAIN> {
    reverse_proxy http://<VAULTWARDEN_IP>:80 {
        header_up CF-Connecting-IP {remote_host}
    }
}
```

Then configure Vaultwarden to read it:

```bash
IP_HEADER=CF-Connecting-IP
```

Now both paths use identical header logic.

## Security Considerations

### Trust Boundaries

![Cloudflare Tunnel status showing healthy connector](cloudflare-tunnel.png)


Only trusted components should set the `CF-Connecting-IP` header:

- **Cloudflare Edge**: Overwrites any incoming `CF-Connecting-IP` header (prevents spoofing)
- **Your reverse proxy**: Only receives traffic from trusted sources

External requests **cannot** spoof this header because:
1. Cloudflare overwrites it at the edge
2. Direct access to Vaultwarden is blocked at the firewall
3. The tunnel only accepts authenticated Cloudflare traffic

### Why This Matters for Password Managers

Accurate IP logging enables:
- **Login alerts**: Know where access attempts originate
- **Audit trails**: Security investigations need real IPs
- **Rate limiting**: Per-client-IP rate limits actually work
- **Future geo-blocking**: Block entire regions if needed

## Failover Behavior

The architecture provides independent failover for each path:

| Failure | External Impact | Internal Impact |
|---------|-----------------|-----------------|
| CF Tunnel down | Fails over to replica (<10s) | None |
| Caddy down | None | Fails over via VRRP (~2s) |
| Both Caddy nodes down | None | Internal access down |

This is the key benefit: critical external access doesn't depend on your reverse proxy.

## Rollback Plan

If issues arise, the previous configuration is documented inline:

```bash
# Vaultwarden .env
# Previous: IP_HEADER=X-Real-IP
IP_HEADER=CF-Connecting-IP

# Caddy config
# Previous: header_up X-Real-IP {remote_host}
header_up CF-Connecting-IP {remote_host}
```

Uncomment the previous lines and restart services to revert.

## Key Takeaways

1. **Direct routing for critical services**: Don't chain your password manager through unnecessary proxies
2. **Unified headers**: Pick one header name and configure all traffic paths to use it
3. **Trust boundaries matter**: Only let trusted components set client IP headers
4. **Document rollback**: Keep previous config commented for emergency reversion
5. **Test from external**: Always verify IP logging works from outside your network

## What I'd Do Differently

Nothing major, but I'd:
- Add this header unification to my standard service onboarding checklist
- Consider documenting the CF Tunnel routing decisions earlier (I discovered the direct routing was in place only when debugging)
