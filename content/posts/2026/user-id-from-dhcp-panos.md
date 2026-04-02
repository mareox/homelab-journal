---
title: "How I Got Every Device Named in My Firewall Logs (Without Active Directory)"
date: 2026-04-01
tags: ["lesson-learned", "tutorial", "panos", "user-id", "dhcp", "unifi", "automation"]
topics: ["firewall", "networking", "automation", "homelab"]
featured: true
---

## The Problem Nobody Talks About

If you run a Palo Alto firewall at home, your traffic logs are full of this:

```
192.168.10.128 -> 8.8.8.8    action: allow    user: unknown
192.168.30.240 -> 1.1.1.1    action: allow    user: unknown
172.30.50.77   -> 52.x.x.x   action: allow    user: unknown
```

Every entry says `unknown`. You know *what* traffic is flowing, but not *which device* is generating it. Is that your kid's iPad? Your smart fridge? A compromised IoT sensor?

PAN-OS has a feature called **User-ID** that maps IPs to usernames in traffic logs. But every guide assumes you have Active Directory. In a homelab? No AD. No Windows domain. No LDAP. Just Linux VMs, Docker containers, phones, smart plugs, and a Ring doorbell.

I spent a full day solving this. Here's what I learned, what failed, and what worked.

## What I Tried First: The Syslog Loopback (Spoiler: It Failed)

A [well-known article](https://jamesholland.me.uk/user-id-from-dhcp/) describes a clever trick: since the PAN-OS firewall IS the DHCP server, it generates log entries for every lease. Configure a syslog profile that sends those logs back to the firewall's own management interface, where the User-ID syslog listener parses them with regex.

I implemented all four components via the XML API:
1. Syslog server profile (loopback to management IP)
2. System log match filter for DHCP lease-start events
3. Syslog parse profile with hostname + IP regex
4. Server monitor linking the parse profile to the listener

**Result: 0 messages received.** The server monitor sat there, listening to silence.

### Why It Fails

The firewall cannot deliver a syslog UDP packet to its own interface. I tested:
- OOB management IP (10.x.x.x): 0 messages
- In-band data-plane IP: 0 messages
- Localhost (127.0.0.1): 0 messages
- Removed the syslog service route to force MGT routing: still 0

**PAN-OS cannot syslog-loopback to itself.** Period. This approach only works if you have an external syslog relay (another server that receives the logs and forwards them back). For a single-firewall homelab, it's a dead end.

### A Useful Side Discovery

While debugging, I discovered the PAN-OS XML API `action=complete` endpoint is incredible for schema exploration:

```
GET /api/?type=config&action=complete&xpath=.../server-monitor/entry/syslog
```

This returns all valid child elements at any xpath, including reference types and keyword values. Saved me hours of guessing the XML structure (which differs significantly from the CLI `set` command syntax).

## What Actually Works: Direct API Push

PAN-OS has a User-ID XML API (`type=user-id`) that accepts bulk login entries:

```xml
<uid-message>
  <version>2.0</version>
  <type>update</type>
  <payload>
    <login>
      <entry name="iPhone" ip="<YOUR_DHCP_IP>" timeout="180"/>
      <entry name="Chromecast-Ultra" ip="<YOUR_DHCP_IP>" timeout="180"/>
    </login>
  </payload>
</uid-message>
```

No firewall configuration changes needed. No syslog. No parse profiles. Just HTTP calls.

The trick is combining **multiple identity sources** to cover every device type:

## The Multi-Source Architecture

```
+-------------------+     +--------------------+     +------------------+
| Pi-hole A Records |     | UniFi Controller   |     | PAN-OS DHCP      |
| (static infra)    |     | (device fingerprint)|    | (dynamic clients)|
| 69 devices        |     | 39 named + 7 OUI   |     | 16 leases        |
+--------+----------+     +---------+----------+     +--------+---------+
         |                           |                          |
         +---------------------------+--------------------------+
                                     |
                              Priority Merge
                                     |
                         +-----------+-----------+
                         | User-ID XML API Push  |
                         | (batched, 50/request) |
                         +-----------+-----------+
                                     |
                              124 Named Mappings
                              on PA-440 Firewall
```

### Source 1: Pi-hole DNS A Records (Priority 1)

Your Pi-hole already has a YAML file with every static IP and hostname in your infrastructure. Proxmox hosts, NAS boxes, reverse proxies, monitoring servers. This is your source of truth for infrastructure devices that don't use DHCP.

### Source 2: UniFi Controller API (Priority 2)

If you run UniFi switches/APs, the controller already fingerprints every connected client. It knows device names, hostnames, manufacturers, and even user-assigned labels from the UI. A session-based API call to `/api/s/default/stat/sta` returns all of it.

This is the biggest win. UniFi knew my Ring doorbells, smart plugs (TP-Link KP115, HS200), Tuya devices, and LG Smart Fridge by name. It even knew the manufacturer (OUI) for devices with no hostname.

### Source 3: PAN-OS DHCP Leases (Priority 3)

The firewall's own DHCP server has a lease table with hostnames for clients that send DHCP option 12. This catches devices not on UniFi ports (VPN clients, wired-only devices).

### Source 4: MAC Vendor Fallback (Priority 4)

For devices with no name from any source, the UniFi OUI field provides the manufacturer. `Amazon-0856` is better than `mac-0cdc9108568d`.

## The Result

Before:
```
192.168.10.128 -> 8.8.8.8    user: unknown
192.168.30.240 -> 1.1.1.1    user: unknown
172.30.50.77   -> 52.x.x.x   user: unknown
```

After:
```
192.168.10.128 -> 8.8.8.8    user: iPhone
192.168.30.240 -> 1.1.1.1    user: graylog
172.30.50.77   -> 52.x.x.x   user: Ring - Front Door
```

**124 devices identified. Zero unknowns on managed ports.**

The script runs every 5 minutes via Ansible/Semaphore. Mappings timeout after 3 hours, so even if a run fails, coverage persists. When I add a new service, the standard process (add a DNS A record or name it in UniFi) automatically gives it a User-ID mapping.

## What I Evaluated and Rejected

| Tool | Why Not |
|------|---------|
| **PacketFence** | Requires 16GB RAM, MariaDB, FreeRADIUS. Enterprise NAC for 802.1X, not homelab device visibility |
| **p0f** | Passive OS fingerprinting, but signature database last updated ~2012. Cannot identify modern devices |
| **Fingerbank** | Device fingerprinting API by the PacketFence team. Interesting, but UniFi already does 80% of this for free |
| **mDNS/Bonjour sniffing** | Requires a listener per VLAN. UniFi already catches most mDNS-announcing devices |
| **PAN-OS Device-ID** | Maps device *type*, not hostname. Requires paid IoT Security license for full coverage |

## Key Takeaways

1. **PAN-OS has no native DHCP-to-User-ID.** Don't waste time with syslog loopback unless you have an external relay.

2. **The User-ID XML API is your best friend.** Simple HTTP calls, no firewall config changes, supports batch + timeout.

3. **Your existing tools already know your devices.** Pi-hole has your DNS records. UniFi has device fingerprints. The firewall has DHCP leases. Combine them.

4. **Batch your API calls.** 124 entries in one URL causes HTTP 414. Split into chunks of 50.

5. **PAN-OS `action=complete` is the undocumented schema explorer.** Use it to discover valid XML elements at any xpath.

---

*Built on a PA-440 running PAN-OS 11.2.10-h2. The full script is ~300 lines of Python with zero dependencies (stdlib only). Runs on any host with network access to the firewall and UniFi controller.*
