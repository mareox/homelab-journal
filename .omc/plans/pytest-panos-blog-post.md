# Plan: Blog Post — pytest for PAN-OS Firewall Config Testing

**Created:** 2026-05-01
**Status:** Ready for execution

---

## Goal

Write a blog post for homelab-journal that:
- Shows network/security engineers how to use pytest to detect PAN-OS configuration drift
- Uses real examples from mx-fw (PA-440, PAN-OS 11.2.11) — sanitized for public
- Is LinkedIn-shareable: original angle, punchy voice, transferable lesson
- Is better than the packetswitch.co.uk pytest/Arista article by focusing on security validation (not just connectivity)

---

## Post Metadata

```yaml
file: content/posts/2026/pytest-panos-firewall-testing/index.md
title: "I Test My Code. Why Not My Firewall?"
description: "Using pytest to catch PAN-OS configuration drift on a PA-440 before it becomes a security incident."
date: 2026-05-01
tags: ["lesson-learned", "lab-note"]
topics: ["panos", "python", "automation", "security", "firewall"]
difficulties: ["intermediate"]
featured: false
```

---

## Requirements

### Acceptance Criteria

- [ ] Every code example is real and runnable (verified against mx-fw XML API patterns)
- [ ] All IPs/hostnames sanitized: `<YOUR_FW_IP>`, `<YOUR_API_KEY>`, generic zone names
- [ ] Post passes `node scripts/validate-content.js` with no errors
- [ ] Has a thumbnail image (AI-generated, dark navy + orange/blue palette)
- [ ] Has TL;DR section within first 3 paragraphs
- [ ] No em dashes anywhere in the post
- [ ] LinkedIn hook angle: relatable opening question, security consequence frame

### What Makes This Better Than the Packetswitch Article

| packetswitch.co.uk | This post |
|-|-|
| Arista eAPI + BGP/OSPF routing state | PAN-OS XML API + security policy validation |
| Connectivity verification | Security drift detection |
| "Is BGP up?" | "Did someone accidentally allow the internet into my IoT VLAN?" |
| No CI integration shown | Semaphore CI integration included |
| Generic device | Real PA-440 with specific zones, rules, conventions |
| No enterprise angle | Security profiles, log forwarding, Panorama scaling callout |

---

## Post Structure

### 1. Hook (150 words)

Open with a relatable scenario:

> Last month I opened a ticket: "temporary" rule to allow a vendor through the firewall. Two months later, that rule is still there. It's not in any config review. Nobody flagged it in monitoring. The firewall looks healthy because it IS healthy — it's just not doing what anyone thinks it's doing.

Transition: "What if you could test your firewall config like you test your code? Structured. Versioned. Automated. With a clear PASS/FAIL output and a CI job that catches drift the moment it happens."

### 2. TL;DR Block

```
pytest + PAN-OS XML API = automated security posture validation.
Tests run against live config, flag drift, integrate with CI.
Takes 30 minutes to set up. Works on any PAN-OS firewall.
```

### 3. Why pytest? (150 words)

- Not a monitoring tool (Prometheus/Grafana can't tell you if a security rule is WRONG, only if the firewall is UP)
- Structured pass/fail with human-readable failure messages
- Version-controlled assertions = auditable security posture
- Parametrization = test every zone/rule/object in one test function
- CI/CD integration: run after every config backup, fail the pipeline if drift is detected

### 4. The Setup: Connecting to PAN-OS (200 words + code)

**Key security note up front:** use a read-only API user. Show how to create one:

```bash
# Create read-only admin user via CLI or GUI
# Then generate API key:
curl -sk "https://<YOUR_FW_IP>/api/?type=keygen&user=<RO_USER>&password=<PASSWORD>"
```

**conftest.py** — the pytest fixture:

```python
# conftest.py
import pytest
import requests
import xml.etree.ElementTree as ET
import urllib3
import os

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class PanOSClient:
    """Minimal read-only client for PAN-OS XML API."""

    def __init__(self, host: str, api_key: str):
        self.base = f"https://{host}/api/"
        self.key = api_key
        self.session = requests.Session()
        self.session.verify = False

    def op(self, cmd: str) -> ET.Element:
        """Run an operational command (show, request, etc.)."""
        r = self.session.get(self.base, params={
            "type": "op", "cmd": cmd, "key": self.key,
        }, timeout=30)
        r.raise_for_status()
        return ET.fromstring(r.text)

    def config(self, xpath: str) -> ET.Element:
        """Retrieve a config subtree by XPath."""
        r = self.session.get(self.base, params={
            "type": "config", "action": "show",
            "xpath": xpath, "key": self.key,
        }, timeout=30)
        r.raise_for_status()
        return ET.fromstring(r.text)


@pytest.fixture(scope="session")
def fw():
    """Session-scoped firewall client. One connection per test run."""
    return PanOSClient(
        host=os.environ["FW_HOST"],
        api_key=os.environ["FW_API_KEY"],
    )
```

**Key insight box** (`scope="session"` = one connection per test run, not one per test):

> `scope="session"` is important. Without it, pytest creates a new client for every test — hundreds of API connections per run. Session scope reuses one client across all tests.

### 5. The Tests (main section, ~600 words)

**Callout box before tests start:**
> All tests below run against my PA-440 (mx-fw). Zone names and rule names match my actual config — adapt them to match yours.

#### Test 1: Smoke Test — Firewall Responds

```python
# test_firewall.py

def test_firewall_reachable(fw):
    root = fw.op("<show><system><info/></system></show>")
    assert root.attrib["status"] == "success"


def test_panos_version_meets_minimum(fw):
    root = fw.op("<show><system><info/></system></show>")
    version = root.findtext(".//sw-version")
    major, minor = (int(x) for x in version.split(".")[:2])
    assert (major, minor) >= (11, 1), \
        f"PAN-OS >= 11.1 required, running {version}"
```

#### Test 2: Deny-All Rule Exists for Untrust Zone

```python
VSYS_XPATH = "/config/devices/entry[@name='localhost.localdomain']/vsys/entry[@name='vsys1']"


def test_deny_all_exists_for_untrust_zone(fw):
    """Verify a deny rule covers traffic originating from the internet."""
    root = fw.config(f"{VSYS_XPATH}/rulebase/security/rules")
    
    deny_from_wan = [
        rule.get("name")
        for rule in root.findall(".//entry")
        if "L3-Outside" in [m.text for m in rule.findall(".//from/member")]
        and rule.findtext(".//action") == "deny"
    ]
    
    assert deny_from_wan, "CRITICAL: No deny rule for untrust zone (L3-Outside)"
```

**Why this matters:** Palo Alto default behavior after all allow rules is implicit deny. But explicit deny rules show intent, enable logging, and catch misconfigurations if zone names change.

#### Test 3: Zone Protection Profiles Applied (Parametrized)

```python
import pytest

ZONE_PROTECTION_PROFILES = {
    "L3-Outside": "zp-untrust",
    "L3-LAN10":   "zp-trust",
    "L3-INFRA":   "zp-trust",
    "L3-Guest":   "zp-midtrust",
    "L3-IOT":     "zp-midtrust",
}


@pytest.mark.parametrize("zone,expected_profile", ZONE_PROTECTION_PROFILES.items())
def test_zone_protection_profile_applied(fw, zone, expected_profile):
    """Every zone must have the correct protection profile."""
    xpath = f"{VSYS_XPATH}/zone/entry[@name='{zone}']"
    root = fw.config(xpath)
    actual = root.findtext(".//zone-protection-profile")
    assert actual == expected_profile, \
        f"Zone {zone}: expected '{expected_profile}', got '{actual}'"
```

**Show pytest -v output:**

```
test_firewall.py::test_zone_protection_profile_applied[L3-Outside-zp-untrust] PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-LAN10-zp-trust]     PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-INFRA-zp-trust]     PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-Guest-zp-midtrust]  PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-IOT-zp-midtrust]    PASSED
```

**One test function. Five zones. Parametrization is doing the heavy lifting.**

#### Test 4: Service Object Naming Convention

```python
import re

SERVICE_NAME_RE = re.compile(r"^(tcp|udp)-\d+")


def test_service_objects_follow_naming_convention(fw):
    """Service objects must follow tcp-PORT or udp-PORT convention.
    
    Enforces the standard so any object named 'http' or 'custom-web'
    is flagged before it pollutes the ruleset.
    """
    root = fw.config(f"{VSYS_XPATH}/service")
    violations = [
        svc.get("name")
        for svc in root.findall(".//entry")
        if not SERVICE_NAME_RE.match(svc.get("name", ""))
    ]
    assert not violations, \
        f"Service objects violate naming convention (tcp-PORT/udp-PORT): {violations}"
```

**Why this test exists:** Every service object on my firewall follows `tcp-22`, `tcp-5022-Synology-SSH`, `udp-51820-WireGuard`. When I named 19 objects incorrectly, it took a manual audit to catch them. Now a test catches it instantly.

#### Test 5: No Unrestricted Allow from Internet (The Scary One)

```python
def test_no_unrestricted_allow_from_internet(fw):
    """No rule should allow 'any' destination from the internet."""
    root = fw.config(f"{VSYS_XPATH}/rulebase/security/rules")
    
    violations = []
    for rule in root.findall(".//entry"):
        from_zones = [m.text for m in rule.findall(".//from/member")]
        destinations = [m.text for m in rule.findall(".//destination/member")]
        action = rule.findtext(".//action")
        
        if (
            "L3-Outside" in from_zones
            and "any" in destinations
            and action == "allow"
        ):
            violations.append(rule.get("name"))
    
    assert not violations, \
        f"CRITICAL: Rules allow unrestricted internet access: {violations}"
```

**Show a failure example** (this is the payoff — what drift detection looks like):

```
FAILED test_firewall.py::test_no_unrestricted_allow_from_internet
AssertionError: CRITICAL: Rules allow unrestricted internet access: ['TEMP-vendor-access']

That 'temporary' rule from last month? Found it.
```

#### Test 6: Every Allow Rule Has a Security Profile Group

This is the enterprise credibility test. In PAN-OS, an allow rule with no security profile group means traffic passes with zero inspection — no antivirus, no vulnerability protection, no URL filtering. It's the most common audit finding in enterprise environments.

```python
def test_allow_rules_have_security_profile_group(fw):
    """Every allow rule must attach a security profile group.
    
    A rule that allows traffic but skips inspection is worse than
    no rule at all — it creates a false sense of security.
    """
    root = fw.config(f"{VSYS_XPATH}/rulebase/security/rules")
    
    violations = [
        rule.get("name")
        for rule in root.findall(".//entry")
        if rule.findtext(".//action") == "allow"
        and rule.find(".//profile-setting/group") is None
    ]
    
    assert not violations, \
        f"Allow rules missing security profile group: {violations}"
```

**Why this matters more than any other test:** Zone protection, deny rules, naming conventions — all important. But an allow rule with no security profiles means PAN-OS is forwarding packets without running any Content-ID inspection. App-ID still works, but threat prevention doesn't. This is the gap that lets malware ride on allowed application traffic.

#### Test 7: All Rules Have Log Forwarding Profiles

```python
LOG_FORWARDING_PROFILE = "LF-Graylog"  # adapt to your SIEM profile name

def test_all_rules_have_log_forwarding(fw):
    """Every security rule must forward logs to the SIEM.
    
    A rule that doesn't log is invisible. Compliance frameworks
    (SOC 2, PCI-DSS, ISO 27001) require evidence of rule evaluation.
    """
    root = fw.config(f"{VSYS_XPATH}/rulebase/security/rules")
    
    violations = [
        rule.get("name")
        for rule in root.findall(".//entry")
        if rule.findtext(".//log-setting") != LOG_FORWARDING_PROFILE
    ]
    
    assert not violations, \
        f"Rules missing log forwarding to {LOG_FORWARDING_PROFILE}: {violations}"
```

**Callout:** Pair this with the security profile test. A rule with profiles but no log forwarding is inspecting traffic silently — alerts fire inside the firewall but never reach your SIEM.

### 6. Running the Tests (100 words)

```bash
# Set credentials (never hardcode these)
export FW_HOST="<YOUR_FW_IP>"
export FW_API_KEY="<YOUR_RO_API_KEY>"

# Run all tests
pytest tests/test_firewall.py -v

# Run just the critical security tests
pytest tests/test_firewall.py -v -k "untrust or internet"
```

Full output screenshot or code block showing all passing.

### 7. CI Integration with Semaphore (150 words)

Reference the existing Semaphore setup in the homelab.

```yaml
# .semaphore/firewall-audit.yml
blocks:
  - name: Firewall Config Audit
    task:
      jobs:
        - name: Run pytest security tests
          commands:
            - pip install pytest requests
            - pytest tests/test_firewall.py -v --tb=short
      env_vars:
        - name: FW_HOST
          value: "<YOUR_FW_IP>"
      secrets:
        - name: fw-ro-api-key
```

**Run this on a schedule** (daily) or **trigger after config backup**. Failed test sends an alert before anyone notices something changed.

### 8. Scaling to Enterprise: Panorama (150 words)

**Callout box** — "This runs on one PA-440. Here's how the same pattern scales."

In enterprise environments, firewalls are managed through Panorama (PAN-OS centralized management). The XML API is identical — same XPath structure, same response format — but the base URL and device context change:

```python
# Panorama: test a specific managed firewall's running config
PANORAMA_DEVICE_XPATH = (
    "/config/devices/entry[@name='localhost.localdomain']"
    "/device-group/entry[@name='Branch-Firewalls']"
    "/pre-rulebase/security/rules"
)

# Or: push the test via Panorama's /api/ endpoint
# and target a specific serial number
params = {
    "type": "config",
    "action": "show",
    "xpath": PANORAMA_DEVICE_XPATH,
    "key": PANORAMA_API_KEY,
    "target": "<FIREWALL_SERIAL>",
}
```

One test suite. Parametrize over serial numbers. Test every branch firewall in a single pytest run. The `test_allow_rules_have_security_profile_group` test becomes a compliance sweep across your entire fleet.

### 9. Takeaways (100 words)

1. Your firewall config IS your security posture. Monitor it like one.
2. pytest provides version-controlled, human-readable assertions against live state.
3. Use a read-only API user. Tests should never change config.
4. Parametrization makes one test function cover every zone/rule — maintainable at scale.
5. Security profile group + log forwarding tests catch the audit findings that manual reviews miss.
6. The goal is to find "TEMP-vendor-access" before the quarterly audit does.

### 10. What's Next (50 words)

- Testing NAT rules (verify port forwarding isn't accidentally wide open)
- Traffic flow tests: send packets through the firewall and assert they're allowed/blocked
- Panorama fleet sweep: parametrize over device serial numbers, test every managed firewall in CI

---

## Implementation Steps

1. **Create post directory and index.md**
   ```
   hugo new posts/2026/pytest-panos-firewall-testing.md
   ```
   Then convert to page bundle (mkdir + index.md).

2. **Write the full post** following the structure above.
   - Voice: direct, first person, light humor. Conference talk, not a manual.
   - No em dashes. Replace with commas/semicolons/new sentences.
   - Code blocks: all Python 3.9+ compatible, typed where it aids clarity.

3. **Verify code examples** against actual mx-fw XML API:
   - The XPath patterns and XML tag names match the homelab scripts in `homelab-infra/palo-alto-networks/mx-fw/`
   - Zone names sanitized: keep generic names (L3-Outside, L3-INFRA etc. are not sensitive)
   - IPs sanitized: `<YOUR_FW_IP>`, `<YOUR_API_KEY>`

4. **Generate thumbnail** via nano-banana:
   - Prompt: "dark navy background, pytest green checkmark logo, Palo Alto Networks firewall shield icon in orange, glowing blue circuit lines, 1200x400, homelab tech blog style"

5. **Run content validation**:
   ```bash
   node scripts/validate-content.js --file content/posts/2026/pytest-panos-firewall-testing/index.md
   ```

6. **Commit and push** to trigger GitHub Actions deploy.

---

## Risks and Mitigations

| Risk | Mitigation |
|-|-|
| XPath syntax wrong for PAN-OS 11.2 | Cross-reference against `analyze_network_config.py` which uses identical xpath patterns |
| Zone names are sensitive | L3-Outside, L3-INFRA are generic enough — no location/business info revealed |
| Code examples not runnable | Only use patterns that exist in the homelab scripts |
| Post too long | Target 1,400-1,800 words. If over 2,000, cut "What's Next" |

---

## Verification

- [ ] `hugo server -D` — post renders without errors
- [ ] All code blocks have language hints (```python, ```bash, ```yaml)
- [ ] No 192.168.x.x or 10.x.x.x IPs in the post
- [ ] No hostnames like `mx-fw.mareoxlan.local`
- [ ] `validate-content.js` passes
- [ ] TL;DR appears in first scroll
- [ ] Thumbnail file exists at `thumbnail.png` in post bundle
- [ ] Hugo build: `hugo --minify` completes without errors

---

## ADR

**Decision:** Use raw `requests` + `xml.etree.ElementTree` instead of `pan-python` or `panos` ORM library.

**Drivers:**
1. Homelab scripts already use this pattern — authentic, not invented for the post
2. No extra dependency beyond `requests` (already in pip)
3. Explicit XML parsing teaches readers what the API actually returns

**Alternatives considered:**
- `pan-python` library: cleaner API but adds a dependency and hides the XML structure
- `panos` ORM: too high-level, obscures how the API works, harder to adapt

**Why chosen:** Authenticity and transparency. The goal is teaching the pattern, not the library.

**Consequences:** Slightly more verbose XML parsing code. Tradeoff accepted.

**Follow-ups:** A Part II could show the same tests using `pan-python` for comparison.
