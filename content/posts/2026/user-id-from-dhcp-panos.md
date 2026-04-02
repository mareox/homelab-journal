---
title: "How I Got Every Device Named in My Firewall Logs (Without Active Directory)"
date: 2026-04-01
tags: ["tutorial", "lesson-learned", "panos", "user-id", "dhcp", "unifi", "automation"]
topics: ["firewall", "networking", "automation", "homelab"]
featured: true
---

## The Problem

If you run a Palo Alto firewall at home, your traffic logs look like this:

```
Source IP              Destination            Action    User
───────────────────────────────────────────────────────────────
192.168.10.128         8.8.8.8                allow     unknown
192.168.30.240         1.1.1.1                allow     unknown
172.30.50.77           52.26.132.60           allow     unknown
192.168.10.137         54.192.98.36           allow     unknown
```

Every entry says `unknown`. You know what traffic is flowing, but not which device is generating it. Is 192.168.10.128 your kid's iPad? Your smart fridge? A compromised IoT camera?

PAN-OS has a feature called **User-ID** that maps IPs to usernames. But every guide assumes Active Directory. In a homelab with Linux VMs, Docker containers, phones, and IoT devices, there's no AD. No Windows domain. No LDAP.

Here's how I solved it, what failed, and the multi-source architecture that now identifies **every device** on my network.

## What Failed: The Syslog Loopback Approach

A [well-known article](https://jamesholland.me.uk/user-id-from-dhcp/) describes a clever trick. Since the PAN-OS firewall IS the DHCP server, it generates log entries for every lease. You configure a syslog profile that sends those logs back to the firewall's own management interface, where the User-ID syslog listener parses them with regex.

I implemented all four components via the XML API:

```
1. Syslog server profile  →  sends DHCP logs to mgmt IP (UDP/514)
2. System log match filter →  captures (eventid eq lease-start)
3. Syslog parse profile    →  regex extracts hostname + IP
4. Server monitor          →  links parse profile to syslog listener
```

**Result: 0 messages received.** After an hour of debugging, testing three different target IPs (OOB management, in-band data-plane, localhost), and even removing the syslog service route to force management-plane routing, the answer became clear:

**PAN-OS cannot deliver syslog to its own interface.** The packet leaves the management plane but never arrives at the User-ID listener. This approach only works with an external syslog relay, and for a single-firewall homelab, that defeats the purpose.

## What Works: The User-ID XML API

PAN-OS has an API endpoint (`type=user-id`) that accepts bulk login entries. No firewall configuration changes needed. No syslog. No parse profiles. Just HTTP calls:

```xml
POST https://<FIREWALL>/api/?type=user-id&key=<API_KEY>&cmd=
<uid-message>
  <version>2.0</version>
  <type>update</type>
  <payload>
    <login>
      <entry name="iPhone"         ip="192.168.10.128" timeout="180"/>
      <entry name="graylog"        ip="192.168.30.240" timeout="180"/>
      <entry name="Ring-FrontDoor" ip="172.30.50.77"   timeout="180"/>
    </login>
  </payload>
</uid-message>
```

The `timeout` (in minutes) auto-expires stale entries. Run the script every 5 minutes with a 180-minute timeout, and you have continuous coverage even if a few runs fail.

But where do the hostnames come from? That's where the multi-source architecture comes in.

## The Architecture: Three Sources, One Priority Merge

No single source knows every device. DHCP only sees dynamic clients. DNS records only cover static infrastructure. The UniFi controller only sees devices on its switches. **Combine all three and you cover everything.**

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

### Why This Priority Order?

1. **Pi-hole A records win** because they're manually curated with clean, short names (`graylog`, `sema`, `atlas`). These cover static infrastructure devices that never use DHCP.

2. **UniFi user-assigned names** are second because they're human-curated in the UniFi UI (`Ring - Front Door`, `NAS-920-Eth1`). UniFi also provides hostnames and manufacturer (OUI) data from device fingerprinting.

3. **DHCP hostnames** fill remaining gaps. Many clients send their hostname in DHCP option 12 (`mario-pc`, `iPhone`, `Chromecast-Ultra`).

4. **MAC vendor fallback** catches devices with no name from any source. `Amazon-08568d` is more useful than `mac-0cdc9108568d`.

## Step-by-Step Implementation

### Prerequisites

- PAN-OS firewall acting as DHCP server (any model)
- Admin API key for the firewall
- Python 3.x on any host with network access to the firewall
- (Optional) UniFi controller with admin credentials
- (Optional) Pi-hole with A records in YAML format

### Step 1: Get Your PAN-OS API Key

Generate an API key via the PAN-OS API:

```bash
curl -sk "https://<FIREWALL>/api/?type=keygen&user=<ADMIN>&password=<PASS>"
```

Save the key. You'll use it for all API calls.

### Step 2: Query DHCP Leases

The firewall's operational API returns all active DHCP leases:

```python
def get_dhcp_leases(base_url, api_key, ctx):
    """Query all DHCP leases from the firewall."""
    root = api_call(base_url, {
        "type": "op",
        "cmd": ("<show><dhcp><server><lease>"
                "<interface>all</interface>"
                "</lease></server></dhcp></show>"),
        "key": api_key,
    }, ctx)

    leases = []
    for entry in root.findall(".//entry"):
        ip = entry.find("ip")
        hostname = entry.find("hostname")
        mac = entry.find("mac")
        state = entry.find("state")

        if ip is None:
            continue

        # Include reserved leases WITH hostnames (DHCP reservations)
        host_text = hostname.text if hostname is not None else None
        if host_text and host_text not in ("[Unavailable]", ""):
            username = host_text
        elif state is not None and state.text == "reserved":
            # Reserved without hostname = MAC reservation, skip
            continue
        elif mac is not None:
            username = f"mac-{mac.text.replace(':', '')}"
        else:
            continue

        leases.append({"ip": ip.text, "username": username, "source": "dhcp"})
    return leases
```

**Gotcha:** PAN-OS marks DHCP reservations as `state=reserved`. The original version of this script skipped ALL reserved leases, which meant statically-assigned DHCP clients with hostnames (like my main workstation) were invisible. The fix: only skip reserved leases that have no hostname.

### Step 3: Load Static DNS Records

If you maintain Pi-hole A records (or any hostname-to-IP mapping file), parse it as a second source. This covers infrastructure devices with static IPs outside the DHCP pool:

```python
def get_static_mappings(yaml_path):
    """Read Pi-hole A records YAML for static hostname-to-IP mappings."""
    mappings_by_ip = {}  # Keep shortest hostname per IP
    current_ip = None

    with open(yaml_path) as f:
        for line in f:
            line = line.strip()
            # Parse:  - ip: "192.168.30.240"
            ip_match = re.match(r'- ip:\s*"([^"]+)"', line)
            if ip_match:
                current_ip = ip_match.group(1)
                continue
            # Parse:    hostname: "graylog.mydomain.local"
            host_match = re.match(r'hostname:\s*"([^"]+)"', line)
            if host_match and current_ip:
                hostname = strip_domain_suffix(host_match.group(1))
                if current_ip not in mappings_by_ip or \
                   len(hostname) < len(mappings_by_ip[current_ip]):
                    mappings_by_ip[current_ip] = hostname
                current_ip = None

    return [{"ip": ip, "username": h, "source": "static"}
            for ip, h in mappings_by_ip.items()]
```

**Tip:** When an IP has multiple A records (e.g., `caddy1.mydomain.local` and `caddy.mydomain.local`), keep the shortest name. `caddy` is more readable in logs than the FQDN.

### Step 4: Query UniFi Controller (Optional but Powerful)

The UniFi controller already fingerprints every device on your network. It knows user-assigned names, DHCP hostnames, and the manufacturer (OUI). The API requires session-based authentication:

```python
def get_unifi_clients(url, username, password):
    """Query UniFi Controller for client identity data."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    # Session-based auth with cookie jar
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(cj),
        urllib.request.HTTPSHandler(context=ctx))

    # Login
    login_data = json.dumps(
        {"username": username, "password": password}
    ).encode()
    req = urllib.request.Request(
        f"{url}/api/login",
        data=login_data,
        headers={"Content-Type": "application/json"})
    opener.open(req)

    # Get all connected clients
    resp = opener.open(
        urllib.request.Request(f"{url}/api/s/default/stat/sta"))
    clients = json.loads(resp.read().decode()).get("data", [])

    # Logout
    try:
        opener.open(urllib.request.Request(
            f"{url}/api/logout", method="POST"))
    except Exception:
        pass

    # Extract identity data with two tiers
    named = []    # User-assigned names + hostnames (Priority 2)
    oui_list = [] # Manufacturer fallback (Priority 4)

    for c in clients:
        ip = c.get("ip") or c.get("last_ip")
        if not ip:
            continue

        user_name = c.get("name", "").strip()   # Set in UniFi UI
        hostname = c.get("hostname", "").strip() # From DHCP
        oui = c.get("oui", "").strip()           # Manufacturer
        mac = c.get("mac", "")

        if user_name:
            named.append({"ip": ip, "username": user_name,
                          "source": "unifi-name"})
        elif hostname and hostname.lower() not in ("wlan0", "localhost"):
            named.append({"ip": ip, "username": hostname,
                          "source": "unifi-hostname"})

        # OUI fallback: "Amazon-08568d" is better than "mac-0cdc9108568d"
        if oui and not user_name:
            short_mac = mac.replace(":", "")[-6:]
            oui_list.append({"ip": ip,
                             "username": f"{oui.split()[0]}-{short_mac}",
                             "source": "unifi-oui"})

    return named, oui_list
```

**What UniFi reveals that DHCP doesn't:**

| Device | DHCP Hostname | UniFi Name |
|--------|--------------|------------|
| Fire TV Stick | `[Unavailable]` | `HO-FTV4kUltra` |
| Ring Doorbell | `(empty)` | `Ring - Front Door` |
| TP-Link Smart Plug | `(empty)` | OUI: `TP-Link-83d482` |
| Smart Fridge | `(empty)` | `LG_Smart_Fridge2_open` |

### Step 5: The Priority Merge

This is the core logic. A simple dictionary merge where the first source to claim an IP wins:

```python
all_mappings = {}  # ip -> {username, source}

# Priority 1: Static DNS (infrastructure, always wins)
for s in get_static_mappings(yaml_path):
    all_mappings[s["ip"]] = s

# Priority 2: UniFi user-assigned names and hostnames
unifi_named, unifi_oui = get_unifi_clients(url, user, password)
for client in unifi_named:
    if client["ip"] not in all_mappings:
        all_mappings[client["ip"]] = client

# Priority 3: DHCP hostnames
for lease in get_dhcp_leases(base_url, api_key, ctx):
    if lease["ip"] not in all_mappings:
        all_mappings[lease["ip"]] = lease

# Priority 4: Upgrade remaining "mac-XXXX" entries with OUI vendor
for oui in unifi_oui:
    ip = oui["ip"]
    if ip in all_mappings and all_mappings[ip]["username"].startswith("mac-"):
        all_mappings[ip] = oui  # Replace ugly MAC with vendor name
```

**Why this order matters:** If a Proxmox host (static IP `192.168.30.205`) appears in both Pi-hole A records (as `pve5`) and in UniFi (as `PVE5` or with OUI `G-Pro Computer`), the A record name wins because it's cleaner and manually curated.

### Step 6: Batch Push via User-ID API

PAN-OS has a URL length limit. With 124+ entries, a single request causes HTTP 414. Split into batches of 50:

```python
def push_userid_mappings(base_url, api_key, ctx, mappings,
                         timeout_min=180, batch_size=50):
    for i in range(0, len(mappings), batch_size):
        batch = mappings[i:i + batch_size]

        entries = []
        for m in batch:
            # XML-escape the username
            username = (m["username"]
                .replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace('"', "&quot;"))
            entries.append(
                f'<entry name="{username}" ip="{m["ip"]}" '
                f'timeout="{timeout_min}"/>')

        uid_cmd = (
            "<uid-message><version>2.0</version>"
            "<type>update</type><payload><login>"
            + "".join(entries)
            + "</login></payload></uid-message>")

        root = api_call(base_url, {
            "type": "user-id", "cmd": uid_cmd, "key": api_key
        }, ctx)

        if root.get("status") != "success":
            raise RuntimeError(f"Batch {i//batch_size+1} failed")
```

### Step 7: Automate with Cron

Run the script every 5 minutes. I use Ansible + Semaphore, but a simple cron works too:

```bash
*/5 * * * * cd /path/to/scripts && python3 sync_userid_dhcp.py >> /var/log/userid-sync.log 2>&1
```

The 180-minute timeout means mappings survive 36 missed runs before going stale.

## The Result

After:

```
Source IP              Destination            Action    User
───────────────────────────────────────────────────────────────
192.168.10.128         8.8.8.8                allow     iphone
192.168.30.240         1.1.1.1                allow     graylog
172.30.50.77           52.26.132.60           allow     ring - front door
192.168.10.137         54.192.98.36           allow     lgwebostv
192.168.30.66          17.253.144.10          allow     sema
192.168.10.24          140.82.112.4           allow     mario-pc
192.168.30.210         104.18.12.33           allow     atlas
```

**124 devices identified across all VLANs:**

```
Source breakdown:
  Pi-hole A records (static):    69 devices
  UniFi named clients:           34 devices
  UniFi user-assigned names:      5 devices
  UniFi OUI vendor fallback:     10 devices
  PAN-OS DHCP leases:             6 devices
  ─────────────────────────────────────────
  Total:                        124 mappings
```

Sample devices now identified: Proxmox hosts, Caddy reverse proxies, NFS servers, Graylog, Semaphore, n8n, Ring doorbells, TP-Link smart plugs (KP115, HS200, HS220), Tuya smart devices, LG Smart Fridge, iRobot Roomba, Aqara Zigbee hub, Wyze cameras, Chromecast Ultra, Fire TV, NAS boxes, KVMs, and more.

## What I Evaluated and Rejected

| Tool | Why Skip |
|------|---------|
| **PacketFence** | Enterprise NAC: 16GB RAM, MariaDB, FreeRADIUS. Designed for 802.1X, not homelab device visibility |
| **p0f** | Passive OS fingerprinting with signatures from 2012. Cannot identify modern devices |
| **Fingerbank** | Device fingerprint API. Interesting, but UniFi already does 80% of this for free |
| **mDNS/Bonjour** | Requires a listener per VLAN. UniFi catches most mDNS-announcing devices anyway |
| **PAN-OS Device-ID** | Maps device *type* not hostname. Needs paid IoT Security license |

## Key Takeaways

1. **PAN-OS has no native DHCP-to-User-ID.** The syslog loopback fails on single-firewall setups. Use the XML API.

2. **Your existing tools already know your devices.** Pi-hole has DNS records. UniFi has device fingerprints. The firewall has DHCP leases. Combine them.

3. **Priority merge is the pattern.** Static DNS wins over UniFi, which wins over DHCP. First source to claim an IP keeps it. OUI upgrades ugly MAC fallbacks.

4. **Batch your API calls.** 50 entries per request avoids HTTP 414 URI-too-long errors.

5. **The script is 300 lines of Python with zero dependencies.** Uses only `urllib`, `ssl`, `json`, `re`, and `xml.etree` from the standard library. No pip install needed.

The full script is open source and runs on any host with network access to the firewall.

---

*Built on a PA-440 running PAN-OS 11.2. Automated via Ansible/Semaphore (every 5 min). Compatible with any PAN-OS firewall that serves DHCP.*
