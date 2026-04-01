---
title: "Lesson Learned: User-ID from DHCP on PAN-OS (When Syslog Loopback Fails)"
date: 2026-04-01
tags: ["lesson-learned", "panos", "user-id", "dhcp"]
topics: ["firewall", "networking", "automation"]
---

## The Problem

I wanted to see device hostnames in my PAN-OS traffic logs instead of raw IP addresses. The firewall already acts as the DHCP server for all VLANs, so it knows which hostname requested which IP. The question was: how to feed that into the User-ID engine?

I found [this article by James Holland](https://jamesholland.me.uk/user-id-from-dhcp/) describing a clever syslog loopback approach: configure the firewall to forward DHCP lease events back to its own management interface's User-ID syslog listener, where a parse profile extracts the hostname and IP.

## What I Tried

### Attempt 1: Syslog Loopback (Article's Approach)

I configured all four components via the XML API:

1. **Syslog server profile** pointing to the management IP (UDP/514)
2. **System log match filter** for `(eventid eq lease-start)`
3. **Syslog parse profile** with regex for hostname and IP extraction
4. **Server monitor** linking the parse profile to the syslog listener

The commit succeeded, but the server monitor showed **0 log messages received**. DHCP lease events were being generated (I could see them in the system logs), but the syslog packets never arrived at the User-ID listener.

### Why It Failed

My firewall has **service routes** configured to send all management plane traffic (including syslog) through a data-plane interface rather than the dedicated management port. This is common when your management network is isolated on a separate subnet.

When syslog routes through the data plane and the destination is the firewall's own IP, PAN-OS cannot hairpin the UDP packet back to itself. The packet leaves the data plane but has nowhere to go because the destination is a local address.

I tried three variations:
- **OOB management IP** (the dedicated MGT port address): 0 messages
- **Localhost (127.0.0.1)**: 0 messages
- **In-band IP** (data-plane interface): 0 messages
- **Removed the syslog service route** so traffic routes via MGT by default: still 0 messages

**PAN-OS fundamentally cannot deliver syslog to its own User-ID listener**, regardless of routing. The syslog loopback approach only works with an external relay (send to another host that forwards back).

### PAN-OS XML API Schema Discovery

Along the way, I learned that the `server-monitor` XML schema is different from what the CLI `set` commands suggest. The API's `action=complete` endpoint is invaluable for walking the schema tree:

```
POST /api/?type=config&action=complete&xpath=.../server-monitor/entry[@name='test']/syslog
```

This revealed that `syslog-parse-profile` uses an `<entry name="...">` reference format (not text content), and `event-type` nests inside the profile entry reference, not as a sibling of `address`/`connection-type`.

## The Solution

Instead of the syslog loopback, I used the **User-ID XML API** to push mappings directly. The approach combines two data sources:

### Source 1: DHCP Leases (Dynamic Clients)

Query the DHCP lease table via operational command, extract hostname (or MAC as fallback), and push via `type=user-id`:

```python
# Get all DHCP leases
data = api({"type": "op", "cmd": "<show><dhcp><server><lease>..."})

# Push mappings
uid_cmd = '<uid-message><version>2.0</version><type>update</type>' \
          '<payload><login>' \
          '<entry name="hostname" ip="x.x.x.x" timeout="180"/>' \
          '</login></payload></uid-message>'
api({"type": "user-id", "cmd": uid_cmd})
```

### Source 2: Pi-hole DNS A Records (Static Infrastructure)

Most infrastructure devices use static IPs outside the DHCP pool. These are already documented in Pi-hole's A records file (the source of truth for DNS). The script reads this YAML and fills gaps that DHCP doesn't cover.

### Automation

An Ansible playbook runs every 5 minutes via Semaphore CI/CD. It writes an inline Python script to `/tmp`, executes it, and cleans up. The script batches API calls (50 entries per request) to avoid HTTP 414 errors with large mapping sets.

**Result: 121 named User-ID mappings** (53 DHCP + 68 static) covering every device across all VLANs.

## Root Cause

PAN-OS cannot syslog-loopback to itself. This is a platform limitation, not a configuration error. The article's approach works if you have an external syslog relay, but for a homelab with a single firewall, the direct API approach is simpler and more reliable.

## Key Takeaways

1. **PAN-OS syslog loopback doesn't work** when you only have one firewall. Don't spend time debugging routing; use the User-ID XML API instead.

2. **The User-ID XML API is powerful and simple.** `type=user-id` with `<uid-message>` login entries. No configuration changes needed on the firewall, just API calls.

3. **Combine DHCP leases with DNS records** for full coverage. DHCP covers dynamic clients; DNS A records cover static infrastructure. Together they map every device on the network.

4. **Batch your API calls.** With 100+ mappings, a single URL-encoded request exceeds HTTP URI length limits. Split into batches of 50.

5. **PAN-OS `action=complete` is your schema explorer.** When the XML API documentation is unclear, use this endpoint to discover valid child elements, reference types, and keyword values at any xpath.
