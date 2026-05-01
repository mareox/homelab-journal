---
title: "I Test My Code. Why Not My Firewall?"
description: "Using pytest to catch PAN-OS configuration drift on a PA-440. Live firewall tests, real findings, CI integration."
date: 2026-05-01
tags: ["lesson-learned", "lab-note"]
topics: ["panos", "python", "automation", "security", "firewall", "pytest"]
difficulties: ["intermediate"]
featured: false
---

## TL;DR

pytest runs against the PAN-OS XML API. Tests verify zone protection profiles, security rules, and naming conventions against live firewall config. Took 30 minutes to set up. Found real issues on my PA-440 in the first run.

---

Last month I added a "temporary" rule to let a vendor reach an internal service. Two weeks later, I had no idea if the rule was still correct, still scoped correctly, or still needed at all.

Monitoring tools told me the firewall was healthy. Grafana showed sessions, CPU, memory, all nominal. But none of that tells you whether your security rules still match your intent.

What I actually wanted was something like this:

```text
$ pytest tests/test_firewall.py -v
...
FAILED test_firewall.py::test_no_unrestricted_allow_from_internet
AssertionError: CRITICAL: Rules allow unrestricted internet access: ['TEMP-vendor-access']
```

A clear pass/fail against live config. Version-controlled assertions. Something I can run in CI after every config backup.

So I built it.

---

## Why pytest?

pytest is usually for unit tests. But at its core it's just a framework for making assertions and reporting pass/fail results with clear output. That maps directly to "does my firewall config match what I think it does?"

The advantages over manual audits:

- **Structured output**: Every test has a name, result, and failure message. No spreadsheet required.
- **Version controlled**: Your test suite is code. It lives in git. PRs change it. History shows what you verified and when.
- **CI/CD integration**: Run after every config backup. Failed test means something changed. Alert fires before the quarterly audit finds it.
- **Parametrization**: One test function covers every zone, every rule, every object. No copy-paste.

---

## The Setup

You need a read-only API user on the firewall. Never run tests with admin credentials — tests should never modify config, and a read-only key limits blast radius if it leaks.

```bash
# GUI: Device > Administrators > your RO user > Generate API Key
# Docs: docs.paloaltonetworks.com/pan-os/11-2/pan-os-panorama-api/get-started-with-the-pan-os-xml-api/get-your-api-key
```

Then store credentials as environment variables (never hardcode them):

```bash
export FW_HOST=<YOUR_FW_IP>
export PANOS_KEY=<YOUR_RO_API_KEY>
```

This same XML API pattern powers other homelab automations — if you've read [How I Got Every Device Named in My Firewall Logs]({{< relref "/posts/2026/user-id-from-dhcp-panos" >}}), the approach is identical.

The client class wraps the PAN-OS XML API with two methods: `op()` for operational commands and `config()` for config retrieval by XPath:

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

    def __init__(self, host: str, key: str):
        self.base = f"https://{host}/api/"
        self.key = key
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
    if not os.environ.get("FW_HOST") or not os.environ.get("PANOS_KEY"):
        pytest.skip("FW_HOST and PANOS_KEY must be set")
    return PanOSClient(
        host=os.environ["FW_HOST"],
        key=os.environ["PANOS_KEY"],
    )
```

`scope="session"` matters here. Without it, pytest creates a new client per test — that's 14 separate API handshakes. Session scope reuses one client across all tests.

> **Running vs candidate config:** `type=config&action=show` reads the active running config — what is actually enforced right now. Use `action=get` if you want to validate candidate config before committing. For drift detection, `show` is what you want.

---

## The Tests

All tests below run against my PA-440 on PAN-OS 11.2.11. Zone names and rule names reflect my actual config — adapt them to yours.

```python
# test_firewall.py
import re
import pytest

VSYS_XPATH = (
    "/config/devices/entry[@name='localhost.localdomain']"
    "/vsys/entry[@name='vsys1']"
)
```

### Smoke: Reachable and Running a Supported Version

```python
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

### Security: Explicit Deny Rule Covers the Internet Zone

PAN-OS has an implicit deny at the bottom of every rulebase. But an explicit deny rule shows intent, enables custom logging, and survives zone renaming.

```python
def test_deny_all_exists_for_untrust_zone(fw):
    root = fw.config(f"{VSYS_XPATH}/rulebase/security/rules")
    deny_from_wan = [
        rule.get("name")
        for rule in root.findall(".//entry")
        if "L3-Outside" in [m.text for m in rule.findall(".//from/member")]
        and rule.findtext(".//action") == "deny"
    ]
    assert deny_from_wan, "CRITICAL: No deny rule for untrust zone"
```

### Security: Zone Protection Profiles Applied (Parametrized)

This is where pytest parametrization pays off. One function, five zones:

```python
ZONE_PROTECTION_PROFILES = {
    "L3-Outside": "zp-untrust",
    "L3-LAN10":   "zp-trust",
    "L3-INFRA":   "zp-trust",
    "L3-Guest":   "zp-midtrust",
    "L3-IOT":     "zp-midtrust",
}


@pytest.mark.parametrize("zone,expected_profile", ZONE_PROTECTION_PROFILES.items())
def test_zone_protection_profile_applied(fw, zone, expected_profile):
    xpath = f"{VSYS_XPATH}/zone/entry[@name='{zone}']"
    root = fw.config(xpath)
    actual = root.findtext("./result/entry/network/zone-protection-profile")
    assert actual == expected_profile, \
        f"Zone {zone}: expected '{expected_profile}', got '{actual}'"
```

Output:

```text
test_firewall.py::test_zone_protection_profile_applied[L3-Outside-zp-untrust] PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-LAN10-zp-trust]     PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-INFRA-zp-trust]     PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-Guest-zp-midtrust]  PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-IOT-zp-midtrust]    PASSED
```

### Security: Critical Rules Still Exist

Rules that enable core infrastructure should be verified to still be there after every change:

```python
CRITICAL_RULES = ["ALLOW-Proxy-Local", "ALLOW - INFRA-IntraZ"]


@pytest.mark.parametrize("rule_name", CRITICAL_RULES)
def test_critical_rule_exists(fw, rule_name):
    xpath = (
        f"{VSYS_XPATH}/rulebase/security/rules"
        f"/entry[@name='{rule_name}']"
    )
    root = fw.config(xpath)
    assert root.get("status") == "success" and root.find("./result/entry") is not None, \
        f"Critical rule '{rule_name}' is missing"
```

### Security: No Unrestricted Allow from the Internet

```python
def test_no_unrestricted_allow_from_internet(fw):
    root = fw.config(f"{VSYS_XPATH}/rulebase/security/rules")
    violations = [
        rule.get("name")
        for rule in root.findall(".//entry")
        if "L3-Outside" in [m.text for m in rule.findall(".//from/member")]
        and "any" in [m.text for m in rule.findall(".//destination/member")]
        and rule.findtext(".//action") == "allow"
    ]
    assert not violations, \
        f"CRITICAL: Rules allow unrestricted internet access: {violations}"
```

### Enterprise: Allow Rules Have Security Profile Groups

An allow rule with no security profile group forwards traffic with App-ID enforcement but zero Content-ID inspection. No antivirus scan. No vulnerability protection. No URL filtering. The traffic is identified and allowed, but not inspected.

```python
def test_allow_rules_have_security_profile_group(fw):
    """Every allow rule must attach a security profile group."""
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

### Enterprise: All Allow Rules Forward Logs to SIEM

A rule that doesn't ship logs to your SIEM is invisible to threat detection:

```python
def test_allow_rules_have_log_forwarding(fw):
    """Every allow rule must have a log forwarding profile."""
    root = fw.config(f"{VSYS_XPATH}/rulebase/security/rules")
    violations = [
        rule.get("name")
        for rule in root.findall(".//entry")
        if rule.findtext(".//action") == "allow"
        and not rule.findtext(".//log-setting")
    ]
    assert not violations, \
        f"Allow rules missing log forwarding profile: {violations}"
```

### Hygiene: Service Object Naming Convention

Every service object on my firewall follows `tcp-PORT` or `udp-PORT`. A test enforces this so typos or legacy names get flagged before they spread:

```python
SERVICE_NAME_RE = re.compile(r"^(tcp|udp)-\d+")
SERVICE_ALLOWLIST = {"tcp-all"}  # built-in special service


def test_service_objects_follow_naming_convention(fw):
    root = fw.config(f"{VSYS_XPATH}/service")
    violations = [
        svc.get("name")
        for svc in root.findall(".//entry")
        if svc.get("name") not in SERVICE_ALLOWLIST
        and not SERVICE_NAME_RE.match(svc.get("name", ""))
    ]
    assert not violations, \
        f"Service objects violate naming convention: {violations}"
```

---

## What It Found on My PA-440

I ran 14 tests against my live PA-440. 11 passed. 3 failed. Here's what the tool caught:

```text
test_firewall.py::test_firewall_reachable                                          PASSED
test_firewall.py::test_panos_version_meets_minimum                                 PASSED
test_firewall.py::test_deny_all_exists_for_untrust_zone                            PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-Outside-zp-untrust]      PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-LAN10-zp-trust]          PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-INFRA-zp-trust]          PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-Guest-zp-midtrust]       PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-IOT-zp-midtrust]         PASSED
test_firewall.py::test_critical_rule_exists[ALLOW-Proxy-Local]                     PASSED
test_firewall.py::test_critical_rule_exists[ALLOW - INFRA-IntraZ]                  PASSED
test_firewall.py::test_no_unrestricted_allow_from_internet                         PASSED
test_firewall.py::test_allow_rules_have_security_profile_group                     FAILED
test_firewall.py::test_allow_rules_have_log_forwarding                             FAILED
test_firewall.py::test_service_objects_follow_naming_convention                    FAILED
```

**Finding 1: 14 allow rules with no security profile group.** Rules handling WireGuard tunnels, SSH jump connections, name resolution, and Cloudflare Tunnel traffic were forwarding packets with App-ID enforcement but no Content-ID inspection attached. Not a misconfiguration — these are mostly infrastructure-to-infrastructure rules where threat inspection is lower priority. But now I know exactly which rules are uninspected, and I can make that a deliberate decision rather than an oversight. The ones touching external traffic get profile groups added. The rest get documented as intentional exceptions.

**Finding 2: Allow rules missing log forwarding.** Several allow rules weren't shipping session logs to Graylog. Locally buffered logs meant alerts were firing inside the firewall but never reaching the SIEM. Fixed by attaching the log forwarding profile to each rule.

**Finding 3: `tcp-all` service object.** This is a built-in PAN-OS service that represents all TCP ports. It doesn't follow the `tcp-PORT` convention because it has no specific port — it's intentionally generic. Added to an allowlist in the test. The naming convention still catches anything else that doesn't conform.

The first finding is the one that matters. Without this test, I would have had no idea how many allow rules were operating without inspection profiles.

---

## Running the Tests

```bash
# Install dependencies
pip install pytest requests

# Set credentials
export FW_HOST=<YOUR_FW_IP>
export PANOS_KEY=<YOUR_RO_API_KEY>

# Run all tests
pytest tests/test_firewall.py -v

# Run only security-critical tests
pytest tests/test_firewall.py -v -k "untrust or internet or profile"

# Short output for CI
pytest tests/test_firewall.py --tb=short
```

---

## CI Integration

The tests are most useful when they run automatically. I trigger them from Semaphore after every config backup job completes:

```yaml
# .semaphore/firewall-audit.yml
blocks:
  - name: Firewall Config Audit
    task:
      jobs:
        - name: pytest security tests
          commands:
            - pip install pytest requests
            - pytest tests/test_firewall.py -v --tb=short
      env_vars:
        - name: FW_HOST
          value: "<YOUR_FW_IP>"
      secrets:
        - name: fw-ro-api-key
```

The API key lives in a Semaphore secret. The pipeline fails if any test fails. Failed pipeline sends a notification before anyone notices something changed.

---

## Scaling to Enterprise: Panorama

This runs against one PA-440. The same pattern scales to an entire firewall fleet via Panorama.

The XML API is identical across single devices and Panorama. The only difference is targeting a specific managed firewall by serial number:

```python
# Query a specific managed firewall via Panorama
r = session.get(panorama_url, params={
    "type": "config",
    "action": "show",
    "xpath": VSYS_XPATH,
    "key": PANORAMA_API_KEY,
    "target": "<FIREWALL_SERIAL>",
})
```

Parametrize over serial numbers. One test run covers every branch firewall. The `test_allow_rules_have_security_profile_group` test becomes a compliance sweep across your entire managed fleet.

---

## Takeaways

1. **Your firewall config is your security posture.** Monitoring tells you the firewall is up. Tests tell you if it's doing what you think it's doing.
2. **Read-only API user, always.** Tests should never modify config. A scoped API key limits blast radius.
3. **pytest parametrization is the multiplier.** One test function for five zones is better than five test functions.
4. **The failures are the point.** My first run found 14 allow rules with no inspection profiles. That's the tool working exactly as intended.
5. **The goal is to find the "temporary" rule before the quarterly audit does.**

---

*Running a PA-440 at home is a bit much. But so is not knowing which of your firewall rules are missing security profiles.*
