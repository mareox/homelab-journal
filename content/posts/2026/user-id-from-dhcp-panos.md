---
title: "How I Got Every Device Named in My Firewall Logs (Without Active Directory)"
date: 2026-04-01
tags: ["tutorial", "lesson-learned", "panos", "user-id", "dhcp", "unifi", "automation"]
topics: ["firewall", "networking", "automation", "homelab"]
featured: true
---

## TL;DR

A Python script that identifies every device on your network in PAN-OS traffic logs, without Active Directory. Combines Pi-hole DNS, UniFi Controller, and DHCP leases into one priority merge. 124 devices named on my PA-440.

**Before:**
```
192.168.10.128  →  8.8.8.8       user: unknown
192.168.30.240  →  1.1.1.1       user: unknown
172.30.50.77    →  52.26.132.60  user: unknown
```

**After:**
```
192.168.10.128  →  8.8.8.8       user: iphone
192.168.30.240  →  1.1.1.1       user: graylog
172.30.50.77    →  52.26.132.60  user: ring - front door
```

---

## Quick Start (5 minutes)

**What you need:**
- A PAN-OS firewall acting as DHCP server (any model, any version with XML API)
- An admin API key for the firewall
- Python 3.6+ on any machine that can reach the firewall over HTTPS

**Step 1:** Generate a PAN-OS API key (run this once):
```bash
curl -sk "https://<FIREWALL_IP>/api/?type=keygen&user=<ADMIN_USER>&password=<PASSWORD>"
```
Copy the key from the `<key>` element in the response.

**Step 2:** Download the script and create a config file:
```bash
# Get the script
curl -O https://raw.githubusercontent.com/mareox/homelab-infra/main/palo-alto-networks/mx-fw/sync_userid_dhcp.py

# Create a .env file with your credentials
cat > .env << 'EOF'
firewall-ip=<YOUR_FIREWALL_IP>
admin-api-key=<YOUR_API_KEY_FROM_STEP_1>
EOF
```

**Step 3:** Run it:
```bash
# Preview what it would do (no changes made)
python3 sync_userid_dhcp.py --dry-run --verbose

# Push mappings to the firewall
python3 sync_userid_dhcp.py --verbose
```

That's it for the basic DHCP setup. Your traffic logs will now show hostnames for every device that sends a DHCP hostname (option 12). Read on to add UniFi and static DNS sources for full coverage.

---

## Prerequisites (Things You Must Configure First)

The script pushes mappings via API, but PAN-OS needs to be told to USE those mappings in logs and policies. If you skip this, the mappings exist but don't appear anywhere.

### 1. Enable User-ID on Your Zones

In the PAN-OS web UI: **Device > User Identification > User Mapping**

Then for each internal zone (Network > Zones > click zone name):
- Check **Enable User Identification**

Or via CLI:
```
set zone <ZONE_NAME> enable-user-identification yes
```

Enable it on every zone where you want to see device names in traffic logs. Don't enable it on your WAN/untrust zone.

### 2. Verify the API Key Works

Test your API key can push User-ID entries:
```bash
curl -sk "https://<FIREWALL_IP>/api/?type=user-id&key=<API_KEY>&cmd=\
<uid-message><version>2.0</version><type>update</type>\
<payload><login>\
<entry name=\"test-device\" ip=\"192.168.1.254\" timeout=\"5\"/>\
</login></payload></uid-message>"
```

You should see `<response status="success">`. The test mapping expires in 5 minutes.

### 3. No Firewall Configuration Changes Needed

Unlike the syslog loopback approach, this script requires **zero configuration on the firewall itself**. No syslog profiles, no parse profiles, no server monitors. Just API calls from an external host.

---

## How the Script Works

### The Core Idea

No single source knows every device:
- **DHCP** only sees dynamic clients (and some don't send hostnames)
- **DNS records** only cover devices you've manually documented
- **UniFi** only sees devices on its switches/APs (not VMs behind virtual bridges)

The script queries all three, merges them by IP with a priority order, and pushes the combined list to PAN-OS.

### The Priority Merge (This Is the Key Concept)

```
┌─────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│  Pi-hole A Records  │  │  UniFi Controller    │  │  PAN-OS DHCP     │
│  (static infra)     │  │  (device fingerprint)│  │  (dynamic leases)│
│                     │  │                      │  │                  │
│  69 devices         │  │  46 devices          │  │  54 leases       │
│  Proxmox, Caddy,    │  │  Ring, smart plugs,  │  │  Phones, laptops │
│  NFS, Graylog, NAS  │  │  NAS, KVMs, TVs      │  │  tablets, IoT    │
└────────┬────────────┘  └──────────┬───────────┘  └────────┬─────────┘
         │ Priority 1               │ Priority 2             │ Priority 3
         │                          │                        │
         └──────────────────────────┼────────────────────────┘
                                    │
                             Priority Merge
                       (first source wins per IP)
                                    │
                         ┌──────────▼──────────┐
                         │  User-ID XML API    │
                         │  Batched push       │
                         │  (50 entries/req)    │
                         └──────────┬──────────┘
                                    │
                           124 Named Mappings
                          on PA-440 Firewall
```

The merge is a Python dictionary where the first source to claim an IP wins:

```python
all_mappings = {}  # ip -> {username, source}

# Priority 1: Static DNS records (manually curated, cleanest names)
for record in static_dns_records:
    all_mappings[record["ip"]] = record

# Priority 2: UniFi client names (user-assigned labels + hostnames)
for client in unifi_clients:
    if client["ip"] not in all_mappings:  # Don't overwrite static
        all_mappings[client["ip"]] = client

# Priority 3: DHCP hostnames (what the device reports itself)
for lease in dhcp_leases:
    if lease["ip"] not in all_mappings:  # Don't overwrite static or UniFi
        all_mappings[lease["ip"]] = lease

# Priority 4: Replace ugly "mac-XXXX" entries with manufacturer names
for oui_entry in unifi_oui_fallbacks:
    ip = oui_entry["ip"]
    if ip in all_mappings and all_mappings[ip]["username"].startswith("mac-"):
        all_mappings[ip] = oui_entry  # "Amazon-08568d" beats "mac-0cdc9108568d"
```

**Why this order?** A real example: my Proxmox host at `192.168.30.205` appears in:
- Pi-hole A records as `pve5` (clean, short, I chose this name)
- UniFi as `PVE5` (from the controller's device fingerprint)
- DHCP: not at all (static IP, no lease)

The A record wins because it's manually curated and the shortest/cleanest.

### The API Push

PAN-OS accepts bulk User-ID entries via a single API call:

```xml
<uid-message>
  <version>2.0</version>
  <type>update</type>
  <payload>
    <login>
      <entry name="iphone"   ip="192.168.10.128" timeout="180"/>
      <entry name="graylog"  ip="192.168.30.240" timeout="180"/>
      <entry name="ring - front door" ip="172.30.50.77" timeout="180"/>
    </login>
  </payload>
</uid-message>
```

- `name`: whatever you want to appear in traffic logs (hostname, device name, etc.)
- `timeout`: minutes until the mapping expires (180 = 3 hours)
- No commit needed. Mappings are dynamic/ephemeral.

**Gotcha: HTTP 414.** With 100+ entries, the URL-encoded XML exceeds the URI length limit. The script batches into groups of 50.

---

## Adding UniFi Controller (Optional, Recommended)

If you run UniFi switches or APs, you already have a goldmine of device identity data. The controller fingerprints every connected client and knows:

| Field | What It Is | Example |
|-------|-----------|---------|
| `name` | Label you set in the UniFi UI | `Ring - Front Door` |
| `hostname` | DHCP hostname the device reported | `LG_Smart_Fridge2_open` |
| `oui` | Manufacturer from MAC address lookup | `Amazon Technologies Inc.` |
| `mac` | Device MAC address | `54:e0:19:83:d4:82` |

**What UniFi reveals that DHCP alone misses:**

| Device | DHCP Hostname | UniFi Knows |
|--------|--------------|-------------|
| Fire TV Stick | `[Unavailable]` | name: `HO-FTV4kUltra` |
| Ring Doorbell | *(empty)* | name: `Ring - Front Door`, OUI: `Ring LLC` |
| TP-Link Smart Plug | *(empty)* | hostname: `KP115`, OUI: `TP-Link` |
| Smart Fridge | *(empty)* | hostname: `LG_Smart_Fridge2_open` |
| Amazon Fire Stick | *(empty)* | OUI: `Amazon Technologies Inc.` |

### UniFi Setup

Add UniFi credentials to your `.env` file:

```bash
# Append to your existing .env
cat >> .env << 'EOF'
UNIFI_CONTROLLER_URL=https://<UNIFI_IP>:8443
UNIFI_USERNAME=<YOUR_UNIFI_ADMIN>
UNIFI_PASSWORD=<YOUR_UNIFI_PASSWORD>
EOF
```

The script auto-detects the UniFi `.env` if it's at `../../unifi/.env` relative to the script, or reads from environment variables `UNIFI_URL`, `UNIFI_USER`, `UNIFI_PASS`.

**UniFi API notes:**
- Uses session-based auth (login with username/password, get cookie, query, logout)
- The endpoint is `GET /api/s/default/stat/sta` (returns all connected clients)
- Works with UniFi Network Application 7.x+ and UniFi OS consoles
- Port 8443 is the default for self-hosted; CloudKey/UDM may differ
- The script handles SSL certificate warnings automatically (self-signed certs are common)

### Tip: Name Your Devices in UniFi

Open the UniFi web UI, go to **Clients**, click any device, and set a friendly name. These names become Priority 2 in the merge and show up in your firewall logs. I named my Ring doorbells, NAS boxes, and KVMs this way.

---

## Adding Static DNS Records (Optional, For Infrastructure)

Devices with static IPs (servers, Proxmox hosts, switches, access points) never appear in DHCP. If you maintain Pi-hole A records or any hostname-to-IP file, the script can read it.

### Pi-hole A Records Format

The script parses this YAML format (used by Pi-hole's DNS management):

```yaml
groups:
  - name: "Reverse Proxy"
    records:
      - ip: "192.168.30.160"
        hostname: "caddy.mydomain.local"
      - ip: "192.168.30.162"
        hostname: "caddy2.mydomain.local"

  - name: "Monitoring"
    records:
      - ip: "192.168.30.240"
        hostname: "graylog.mydomain.local"
      - ip: "192.168.30.194"
        hostname: "prometheus.mydomain.local"
```

**Don't use Pi-hole?** You can substitute any hostname-to-IP source. The script just needs a file it can parse. Adapt the `get_static_mappings()` function to read your format (CSV, JSON, hosts file, whatever you use).

The script auto-discovers the A records file at `../../pihole/dns-records/a-records.yaml` relative to its location, or you can set the `ARECORDS_YAML_PATH` environment variable.

**Domain suffixes are stripped automatically.** `graylog.mydomain.local` becomes `graylog` in traffic logs. When an IP has multiple DNS names, the shortest one is kept.

---

## Gotchas I Hit (Save Yourself the Debugging)

### 1. The Syslog Loopback Doesn't Work

The [commonly-referenced approach](https://jamesholland.me.uk/user-id-from-dhcp/) configures the firewall to forward DHCP lease logs back to its own syslog listener. I implemented all four components (syslog profile, log match filter, parse profile, server monitor).

**Result: 0 messages.** PAN-OS cannot deliver UDP syslog to its own interface. I tested the OOB management IP, the in-band data-plane IP, localhost, and even removed the syslog service route to force management-plane routing. None worked.

This approach requires an **external syslog relay** (another server that receives and re-sends the logs). For a single-firewall homelab, the XML API approach is simpler.

### 2. DHCP Reservations Were Being Skipped

PAN-OS marks DHCP reservations as `state=reserved`. My first version skipped all reserved entries because most are MAC-only reservations without hostnames. But my main workstation (mario-pc) had a DHCP reservation WITH a hostname, and it was invisible.

**Fix:** Only skip reserved entries that have no hostname. If the reservation includes a hostname, use it.

### 3. HTTP 414 URI Too Long

With 124 entries in a single URL-encoded request, the PAN-OS web server rejects it. The script batches into groups of 50.

### 4. UniFi API Requires Session Auth, Not API Keys

The UniFi API key (`X-API-KEY` header) returns 0 clients for the `/stat/sta` endpoint. You must use session-based auth: POST to `/api/login` with username/password, receive a cookie, then query with that cookie.

### 5. PAN-OS XML Schema Differs From CLI Syntax

If you ever need to configure User-ID via the XML API directly, the element structure doesn't match what the CLI `set` commands suggest. The `action=complete` endpoint is your schema explorer:

```
GET /api/?type=config&action=complete&xpath=.../server-monitor/entry/syslog
```

This returns all valid child elements at any xpath. I discovered that `syslog-parse-profile` uses `<entry name="...">` reference format (not text content), and `event-type` nests inside the profile entry.

---

## Automating It (Cron)

The script should run every 5 minutes. Mappings timeout after 180 minutes (3 hours), so you have 36 missed runs of buffer before mappings go stale.

### Option A: Simple Cron

```bash
# Edit crontab
crontab -e

# Add this line (adjust path)
*/5 * * * * cd /path/to/script && python3 sync_userid_dhcp.py >> /var/log/userid-sync.log 2>&1
```

### Option B: Ansible + Semaphore (What I Use)

I run it via a Semaphore CI/CD template with an Ansible playbook that writes inline Python to `/tmp`, executes it, and cleans up. This gives me a web UI for monitoring runs, failure alerts, and centralized credential management.

### Verifying It Works

After running the script, check the firewall:

```bash
# Via API
curl -sk "https://<FW>/api/?type=op&key=<KEY>&cmd=\
<show><user><ip-user-mapping><all></all></ip-user-mapping></user></show>"

# Or via CLI (SSH to firewall)
show user ip-user-mapping all
```

You should see entries like:
```
IP              Vsys   User              Type     Timeout
192.168.10.128  vsys1  iphone            XMLAPI   180
192.168.30.240  vsys1  graylog           XMLAPI   180
172.30.50.77    vsys1  ring - front door XMLAPI   180
```

Check traffic logs (Monitor > Traffic): the "Source User" and "Destination User" columns now show device names.

---

## What I Evaluated and Rejected

Before building this, I researched every tool I could find:

| Tool | What It Does | Why I Skipped It |
|------|-------------|-----------------|
| **PacketFence** | Enterprise NAC with 802.1X, DHCP fingerprinting, RADIUS | Requires 16GB RAM, MariaDB, FreeRADIUS. Wants to BE your DHCP server. No native PAN-OS User-ID integration. Massive overkill for "show device names in logs" |
| **p0f** | Passive OS fingerprinting from network traffic | Signature database last updated ~2012. Cannot identify modern iOS, Android, Windows 11, or recent Linux kernels. Officially unmaintained |
| **Fingerbank** | Cloud API for device fingerprinting (by the PacketFence team) | Interesting enrichment layer, but the UniFi controller already does 80% of this for free. Free tier is 300 requests/hour |
| **mDNS/Bonjour sniffing** | Listen for `.local` hostname broadcasts | Requires a listener daemon on each VLAN. UniFi already catches most mDNS-announcing devices through its normal operation |
| **PAN-OS Device-ID** | Built-in device type classification | Maps device *type* (e.g., "IP Camera"), not hostname. Requires paid IoT Security subscription for full coverage. 0 entries without the license |
| **NetBIOS scanning** | Query Windows devices for computer names | Windows-only, active scanning, UDP 137. Marginal benefit when UniFi already has the data |

---

## Extending the Script

The script is designed to be extended with additional sources. The pattern is simple:

1. Write a function that returns a list of `{"ip": "...", "username": "...", "source": "..."}` dicts
2. Insert it at the right priority level in `main()`
3. The merge logic handles deduplication automatically

Ideas for additional sources:
- **Wazuh agent list** (agent name to IP mapping)
- **Proxmox API** (VM/LXC names to IPs)
- **SNMP discovery** (device sysName for network gear)
- **ARP table + reverse DNS** (PTR record lookups)

---

## Results

**124 devices identified across 6 VLANs, zero pip dependencies:**

```
Source                            Devices    Examples
────────────────────────────────────────────────────────────────
Pi-hole A records (static DNS)    69         graylog, sema, atlas, pve5, caddy
UniFi hostnames                   34         LG_Smart_Fridge2_open, KP115, HS200
UniFi user-assigned names          5         Ring - Front Door, NAS-920-Eth1
UniFi OUI vendor fallback         10         Amazon-08568d, Tuya-5b4b03, Ring-7781ac
PAN-OS DHCP leases                 6         tesla, Mario-s-S23-Ultra
────────────────────────────────────────────────────────────────
Total                            124
```

The script is ~300 lines of Python using only the standard library (`urllib`, `ssl`, `json`, `re`, `xml.etree`). No pip install needed. Runs on any host with HTTPS access to your firewall.

**Source code:** [sync_userid_dhcp.py on GitHub](https://github.com/mareox/homelab-infra/blob/main/palo-alto-networks/mx-fw/sync_userid_dhcp.py)

---

*Built on a PA-440 running PAN-OS 11.2.10-h2. Automated via Semaphore (every 5 min). Compatible with any PAN-OS firewall that has the XML API enabled.*
