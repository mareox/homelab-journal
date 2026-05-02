---
title: "Your Firewall Baseline Should Fail Builds"
description: "Policy-as-Code for PAN-OS: turn minimum security requirements into pytest tests, run them in CI, catch drift before the audit does."
date: 2026-05-01
tags: ["lesson-learned", "lab-note"]
topics: ["panos", "python", "automation", "security", "firewall", "pytest"]
difficulties: ["intermediate"]
featured: false
---

Most organizations can tell you whether their firewalls are healthy. Fewer can prove every allow rule is inspected, logged, owned, and still required.

The gap between those two things is where audits become painful. Multiple firewall admins, emergency changes at 2am, quarterly reviews that turn into archaeology digs, vendor access rules that were "temporary" in February and are still there in October. Nobody disabled them because nobody noticed they were still there. No alert fires when a rule that was supposed to be temporary quietly becomes permanent.

The monitoring stack shows green: CPU fine, sessions normal, no drops. But that tells you the firewall is running, not whether it is enforcing what you think it is enforcing.

There is a better way. Encode the requirements.

If your security baseline lives in a Word document or a PDF, it is a suggestion. If it lives in pytest, it can fail a pipeline.

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

Every security team has a baseline. It usually sounds something like this: every allow rule must log to the SIEM, internet-facing rules must have inspection profiles attached, zone protection must be applied everywhere, exceptions must have owners and expiration dates.

Written down, those are good intentions. Encoded as tests, they are enforcement.

The PAN-OS XML API returns the full running config as XML. Python's `xml.etree.ElementTree` parses it. pytest turns assertions into structured pass/fail output with machine-readable results. None of these are exotic tools. The combination is a lightweight Policy-as-Code pipeline that runs in minutes and costs nothing except the time to write the first test.

The test suite does not patch configs, create rules, or modify anything. It reads the running config and reports violations. The firewall admin still fixes them manually. The automation catches them before the quarterly review does.

---

## Control Catalog

Each row below is a security requirement. The test column is the executable version of it. The compliance column maps it to a standard so audit teams have a reference they can cite:

| Requirement | pytest Control | Compliance Relevance |
|---|---|---|
| All allow rules log to SIEM | `test_allow_rules_have_log_forwarding` | SOC 2 CC6.1, PCI-DSS 10.2 |
| Allow rules have security profiles | `test_allow_rules_have_security_profile_group` | NIST CSF DE.CM-1 |
| No unrestricted internet allow | `test_no_unrestricted_allow_from_internet` | CIS PAN-OS Benchmark |
| Zone protection applied | `test_zone_protection_profile_applied` | PCI-DSS 1.3 |
| Critical rules still exist | `test_critical_rule_exists` | Change detection |
| Explicit deny for untrust zone | `test_deny_all_exists_for_untrust_zone` | Defense in depth |
| Service object naming standard | `test_service_objects_follow_naming_convention` | Operational hygiene |

Seven controls. Each one represents a class of drift that is invisible to monitoring but immediately visible to an auditor.

---

## The Setup

You need a read-only API user on the firewall. Never run tests with admin credentials. Tests should assert, never modify. A read-only key limits blast radius if it leaks and makes it obvious the credential should never be used for anything except reading.

```bash
# GUI: Device > Administrators > your RO user > Generate API Key
# Docs: docs.paloaltonetworks.com/pan-os/11-2/pan-os-panorama-api/get-started-with-the-pan-os-xml-api/get-your-api-key
```

Store credentials as environment variables:

```bash
export FW_HOST=<YOUR_FW_IP>
export PANOS_KEY=<YOUR_RO_API_KEY>
```

This same XML API pattern appears in other PAN-OS automation work. If you have read [How I Got Every Device Named in My Firewall Logs]({{< relref "/posts/2026/user-id-from-dhcp-panos" >}}), the approach is identical.

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

`scope="session"` matters here. Without it, pytest creates a new client per test. Session scope reuses one connection across all tests, which is 14 fewer API handshakes per run.

One important distinction: `type=config&action=show` reads the active running config, what the firewall is actually enforcing right now. Use `action=get` if you want to validate candidate config before a commit. For drift detection, `show` is what you want.

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

pytest parametrization lets one function cover every zone. One test function, five zones, five pass/fail results with distinct names in the output:

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

An allow rule with no security profile group forwards traffic with App-ID enforcement but zero Content-ID inspection. No antivirus scan. No vulnerability protection. No URL filtering. The traffic is identified and allowed, but not inspected. This control flags every allow rule operating without a profile group attached:

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

A rule that does not ship logs to your SIEM is invisible to threat detection. The session happens, the traffic flows, and the SIEM never sees it:

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

No real organization runs zero exceptions. Vendor migration windows, legacy protocol incompatibilities, time-bounded access for third parties: legitimate exceptions exist. The problem is not the exceptions themselves. The problem is when exceptions are undocumented, unowned, and never expire.

The solution is to make exceptions explicit. They live in a file, have owners, have tickets, and have expiration dates. When the expiration date passes, the exception stops working automatically. No manual cleanup required.

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

When the expiration date passes, the exception entry no longer suppresses the failure. The test starts failing again on its own. No one has to remember to clean it up. The `exceptions.yaml` file, committed to git, also becomes documentation. Audit teams can see every known exception, who owns it, what ticket authorized it, and when it was supposed to end.

This turns "we know about it" into something documentable: a time-bounded, owner-assigned, ticket-referenced exception that expires automatically.

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

**Finding 1: 14 allow rules with no security profile group.** Rules handling WireGuard tunnels, SSH jump connections, name resolution, and Cloudflare Tunnel traffic were forwarding packets with App-ID enforcement but no Content-ID inspection. Not all of these are misconfigured, some are deliberately infrastructure-to-infrastructure rules where inspection adds overhead and limited value. But the control surfaced all of them in one pass. The ones touching external traffic got profile groups added. The rest got documented as explicit exceptions with owners and expiration dates. Before this ran, neither list existed.

**Finding 2: Allow rules missing log forwarding.** Several rules were not shipping session logs to the SIEM. Locally buffered logs meant alerts could fire inside the firewall but never reach centralized analysis. Fixed by attaching the log forwarding profile to each affected rule.

**Finding 3: `tcp-all` service object.** This is a built-in PAN-OS service representing all TCP ports. It does not follow `tcp-PORT` convention because it has no specific port. Added to the allowlist in the test. The naming control still catches anything else that does not conform.

The first finding is the one that matters. Before this test, there was no visibility into which allow rules were operating without inspection profiles attached. The control found it in under 30 seconds.

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

The `--junit-xml` flag is important. The XML report becomes audit evidence: timestamped, structured, showing which controls passed, against which firewall, at what time.

```bash
pytest tests/ --tb=short --junit-xml=baseline-report.xml
```

Store the report as a CI artifact. Attach it to SOC 2 evidence packages. Reference it in PCI-DSS firewall review documentation. Instead of manually assembling a spreadsheet of what you checked and when, the pipeline generates it automatically on every run.

Every passing run is a dated attestation that the baseline was verified. Every failing run is an alert before the auditor finds it.

---

## Scaling to Enterprise: Panorama Fleet

This pattern runs against one firewall. The same approach scales to an entire managed fleet via Panorama.

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

Parametrize the test suite over a list of serial numbers. One test run covers every branch firewall. One CI job generates one report per device. `test_allow_rules_have_security_profile_group` becomes a compliance sweep across every managed device in the organization.

One note on Panorama: be aware of pre-rulebase and post-rulebase distinctions when querying managed device configs. Rules pushed from device groups live in pre/post rulebase paths, not the local vsys rulebase. Adjust the XPath accordingly if your fleet relies heavily on Panorama-pushed policy.

---

## Get the Code

The full control suite is available on GitHub, including synthetic XML fixtures so you can run the demo without a live firewall:

**[github.com/mareox/panos-pytest-baseline](https://github.com/mareox/panos-pytest-baseline)**

```bash
git clone https://github.com/mareox/panos-pytest-baseline
cd panos-pytest-baseline
PANOS_FIXTURE_DIR=examples/fixtures uv run pytest tests/ -v
```

Runs immediately. No PA-440 required.

---

## Takeaways

1. **Drift is invisible until the audit.** Executable controls make it visible in seconds.
2. **Requirements in a PDF are suggestions.** Requirements in pytest can fail a pipeline.
3. **Use a read-only API user.** Tests assert, never modify. A scoped key limits blast radius.
4. **The exception model turns "we know about it" into documented, time-bounded, owner-assigned evidence.** Expired exceptions automatically start failing again. No manual cleanup needed.
5. **CI output is audit evidence.** The JUnit XML report is a timestamped attestation of what was verified and when. Stop assembling that spreadsheet manually.

---

*A PA-440 at home is a bit much. But it turns out "which of your allow rules are missing inspection profiles" is a question worth being able to answer in 30 seconds, whether you manage one firewall or a hundred.*
