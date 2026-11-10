---
title: "Your Firewall Baseline Should Fail Builds"
description: "I wrote pytest checks for the minimum settings my PAN-OS firewalls need and made CI fail when a change breaks them."
date: 2026-05-01
tags: ["lesson-learned", "lab-note"]
topics: ["panos", "python", "automation", "security", "firewall", "pytest"]
difficulties: ["intermediate"]
featured: false
---

CPU, sessions, and drops tell me whether a firewall is running. I need a different check to find allow rules that stopped sending logs, lost their inspection profiles, or outlived their owners.

A rule added for vendor access in February can still be there in October. There may have been several admins and a 2 a.m. emergency change since then. By the quarterly review, nobody remembers why the rule still exists.

I put the baseline in pytest so a rule that violates it can fail the pipeline.

---

## TL;DR

```text
Define PAN-OS security requirements as Python assertions.
Run them against live config via the XML API.
Fail CI when reality drifts from baseline.
Export the results as audit evidence.
```

---

## The Principle: Security Requirements Should Be Executable

A firewall baseline can require you to log allow rules to the SIEM, attach inspection profiles to internet-facing rules, apply zone protection, and give exceptions an owner and expiration date.

The PAN-OS XML API returns the running config as XML. Python's `xml.etree.ElementTree` parses it and pytest reports which assertions passed in a format CI can read. It takes minutes to run and uses tools I already had.

The tests read the running config and report violations. A firewall admin still decides what to change and applies the fix.

---

## Control Catalog

The table maps each requirement to its test and gives the audit team a reference for the associated control:

| Requirement | pytest Control | Compliance Relevance |
|---|---|---|
| All allow rules log to SIEM | `test_allow_rules_have_log_forwarding` | SOC 2 CC6.1, PCI-DSS 10.2 |
| Allow rules have security profiles | `test_allow_rules_have_security_profile_group` | NIST CSF DE.CM-1 |
| No unrestricted internet allow | `test_no_unrestricted_allow_from_internet` | CIS PAN-OS Benchmark |
| Zone protection applied | `test_zone_protection_profile_applied` | PCI-DSS 1.3 |
| Critical rules still exist | `test_critical_rule_exists` | Change detection |
| Explicit deny for untrust zone | `test_deny_all_exists_for_untrust_zone` | Defense in depth |
| Service object naming standard | `test_service_objects_follow_naming_convention` | Operational hygiene |

---

## The Setup

Use a read-only API user. The suite only reads the running config, and a scoped key limits what anyone could do if it leaked.

```bash
# GUI: Device > Administrators > your RO user > Generate API Key
# Docs: docs.paloaltonetworks.com/pan-os/11-2/pan-os-panorama-api/get-started-with-the-pan-os-xml-api/get-your-api-key
```

Store credentials as environment variables:

```bash
export FW_HOST=<YOUR_FW_IP>
export PANOS_KEY=<YOUR_RO_API_KEY>
```

I use the same XML API pattern in [How I Got Every Device Named in My Firewall Logs]({{< relref "/posts/2026/user-id-from-dhcp-panos" >}}).

The client wraps the PAN-OS XML API with two methods: `op()` for operational commands and `config()` for config retrieval by XPath:

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

With `scope="session"`, pytest reuses one client across the suite. That saves 14 API handshakes per run.

Use `type=config&action=show` to check the running config. Use `action=get` to check the candidate config before committing it. I use `show` for drift detection.

---

## The Controls

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

### Control: Explicit Deny Rule Covers the Internet Zone

PAN-OS has an implicit deny at the bottom of every rulebase. An explicit deny rule shows intent, enables custom logging profiles, and survives zone renaming. If it disappears after a config change, this test catches it:

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

### Control: Zone Protection Profiles Applied

I parametrize the function over five zones. pytest reports a distinct pass or fail for each zone.

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

```text
test_firewall.py::test_zone_protection_profile_applied[L3-Outside-zp-untrust] PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-LAN10-zp-trust]     PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-INFRA-zp-trust]     PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-Guest-zp-midtrust]  PASSED
test_firewall.py::test_zone_protection_profile_applied[L3-IOT-zp-midtrust]    PASSED
```

### Control: Critical Rules Still Exist

Rules that enable core infrastructure should be present after every change window. If someone accidentally deleted a rule or renamed it, this catches it before the next traffic complaint:

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

### Control: No Unrestricted Allow from the Internet

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

### Control: Allow Rules Have Security Profile Groups

An allow rule without a security profile group still uses App-ID. It skips Content-ID checks such as antivirus, vulnerability protection, and URL filtering. This test finds allow rules with no profile group:

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

### Control: All Allow Rules Forward Logs to SIEM

If the rule skips log forwarding, the SIEM can't see its sessions:

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

### Control: Service Object Naming Convention

Every service object should follow `tcp-PORT` or `udp-PORT`. A test enforces this so typos or legacy names get flagged before they spread:

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

## The Exception Model

Sometimes I need a temporary exception for a vendor migration, an old protocol, or third-party access. The trouble starts when nobody owns the exception or knows when to remove it.

I put each exception in a file with an owner, a ticket, and an expiration date. The test only accepts exceptions that are still current.

```yaml
# exceptions.yaml: documented exceptions to baseline controls
exceptions:
  - rule: ALLOW-Vendor-Temp
    control: test_allow_rules_have_security_profile_group
    owner: network-security
    ticket: CHG-12345
    expires: 2026-06-30
    reason: Vendor migration window, inspection incompatible with legacy protocol
```

Load it in the test suite:

```python
import yaml
from pathlib import Path
from datetime import date

def load_exceptions(path="exceptions.yaml"):
    if not Path(path).exists():
        return []
    with open(path) as f:
        return yaml.safe_load(f).get("exceptions", [])

def is_excepted(rule_name, control_name, exceptions):
    today = date.today()
    for exc in exceptions:
        if exc["rule"] == rule_name and exc["control"] == control_name:
            expires = date.fromisoformat(exc["expires"])
            if expires >= today:
                return True
    return False
```

Update `test_allow_rules_have_security_profile_group` to respect exceptions:

```python
def test_allow_rules_have_security_profile_group(fw):
    exceptions = load_exceptions()
    root = fw.config(f"{VSYS_XPATH}/rulebase/security/rules")
    violations = [
        rule.get("name")
        for rule in root.findall(".//entry")
        if rule.findtext(".//action") == "allow"
        and rule.find(".//profile-setting/group") is None
        and not is_excepted(
            rule.get("name"),
            "test_allow_rules_have_security_profile_group",
            exceptions,
        )
    ]
    assert not violations, \
        f"Allow rules missing security profile group: {violations}"
```

Once the date passes, the test fails again if the underlying rule still violates the baseline. I keep `exceptions.yaml` in Git so reviewers can see who owns the exception, which ticket authorized it, and when it expires.

---

## What It Found on the PA-440

I run this control catalog against a PA-440 running PAN-OS 11.2.11. On the first run, 11 passed and 3 failed. The controls found real gaps:

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

**Finding 1: 14 allow rules had no security profile group.** WireGuard tunnels, SSH jump connections, name resolution, and Cloudflare Tunnel traffic used App-ID without Content-ID inspection. Some rules were deliberately infrastructure-to-infrastructure, where I judged the overhead of inspection higher than the value. I added profile groups to rules touching external traffic and documented the rest as exceptions with owners and expiry dates. Before the test, I had neither list.

**Finding 2: Several allow rules weren't forwarding logs.** The firewall kept those session logs locally, where central analysis couldn't see them. I attached the log forwarding profile to each affected rule.

**Finding 3: The `tcp-all` object failed the naming check.** It's a built-in PAN-OS service for every TCP port, so `tcp-PORT` doesn't fit. I added it to the test's allowlist and kept the check for other names.

Finding the rules without inspection profiles mattered most to me. I didn't have a list before, and the check gave me one in under 30 seconds.

---

## Running the Controls

```bash
export FW_HOST=<YOUR_FW_IP>
export PANOS_KEY=<YOUR_RO_API_KEY>

# Full baseline sweep
pytest tests/ -v

# Only critical security controls
pytest tests/ -v -k "untrust or internet or profile"

# Short output for CI
pytest tests/ --tb=short
```

---

## CI Integration

The controls are most useful when they run automatically. The pattern below triggers from Semaphore after every config backup job completes:

```yaml
# .semaphore/firewall-audit.yml
blocks:
  - name: Firewall Config Audit
    task:
      jobs:
        - name: pytest security controls
          commands:
            - pip install pytest requests pyyaml
            - pytest tests/ -v --tb=short --junit-xml=baseline-report.xml
      env_vars:
        - name: FW_HOST
          value: "<YOUR_FW_IP>"
      secrets:
        - name: fw-ro-api-key
```

`--junit-xml` gives me a structured, timestamped report of which checks ran against the firewall and what passed.

```bash
pytest tests/ --tb=short --junit-xml=baseline-report.xml
```

I can keep the report as a CI artifact for SOC 2 evidence and reference it in PCI-DSS firewall reviews. Each run records what I checked and when.

---

## Scaling to Enterprise: Panorama Fleet

Panorama lets me run the same checks against managed firewalls.

The XML API is identical across single devices and Panorama. Targeting a specific managed firewall uses a `target` parameter with the device serial number:

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

Pass the list of serial numbers to pytest and have the CI job save a report per device. A check such as `test_allow_rules_have_security_profile_group` can then cover every managed branch firewall.

Panorama device-group rules live in the pre- and post-rulebases. If your fleet uses pushed policies, adjust the XPath to read those paths alongside the local vsys rulebase.

---

## Get the Code

The full control suite is available on GitHub, including synthetic XML fixtures so you can run the demo without a live firewall:

**[github.com/mareox/panos-pytest-baseline](https://github.com/mareox/panos-pytest-baseline)**

```bash
git clone https://github.com/mareox/panos-pytest-baseline
cd panos-pytest-baseline
PANOS_FIXTURE_DIR=examples/fixtures uv run pytest tests/ -v
```

The demo runs against the fixtures without a PA-440.

---

## Takeaways

1. Run the baseline after a config change so the next reviewer can see drift while the change is fresh.
2. Use a read-only API user so the suite can only inspect the firewall.
3. Give each exception an owner, ticket, and expiry. The test should fail again when the expiry passes.
4. Keep the JUnit XML report so you can show which requirements were tested and when.

---

*A PA-440 at home is a bit much. But it turns out "which of your allow rules are missing inspection profiles" is a question worth being able to answer in 30 seconds, whether you manage one firewall or a hundred.*
