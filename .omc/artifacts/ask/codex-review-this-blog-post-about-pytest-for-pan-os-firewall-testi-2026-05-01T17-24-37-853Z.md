# codex advisor artifact

- Provider: codex
- Exit code: 0
- Created at: 2026-05-01T17:24:37.853Z

## Original task

Review this blog post about pytest for PAN-OS firewall testing for TECHNICAL ACCURACY. The post uses Python 3, pytest, requests, and xml.etree.ElementTree against the PAN-OS XML API.

Check:
1. Is the XPath pattern correct? VSYS_XPATH = '/config/devices/entry[@name="localhost.localdomain"]/vsys/entry[@name="vsys1"]' - is this the right path for a standalone PAN-OS device?
2. Is 'root.find(".//entry")' the right check for the critical_rule_exists test? The XPath already targets a specific named entry - what does the response look like when the rule doesn't exist vs when it does?
3. Is 'root.findtext(".//zone-protection-profile")' the right path for zone protection profile - or is it under a 'network' subelement?
4. Are the pytest patterns idiomatic - scope='session' fixture, parametrize usage, assertion messages?
5. What's missing that a real network security engineer would add: NAT rules, app-id enforcement check, committed vs candidate config distinction, SSL decryption policy tests?
6. Is using 'type=config&action=show' reading committed or candidate config?

Post content: ---
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

## Final prompt

Review this blog post about pytest for PAN-OS firewall testing for TECHNICAL ACCURACY. The post uses Python 3, pytest, requests, and xml.etree.ElementTree against the PAN-OS XML API.

Check:
1. Is the XPath pattern correct? VSYS_XPATH = '/config/devices/entry[@name="localhost.localdomain"]/vsys/entry[@name="vsys1"]' - is this the right path for a standalone PAN-OS device?
2. Is 'root.find(".//entry")' the right check for the critical_rule_exists test? The XPath already targets a specific named entry - what does the response look like when the rule doesn't exist vs when it does?
3. Is 'root.findtext(".//zone-protection-profile")' the right path for zone protection profile - or is it under a 'network' subelement?
4. Are the pytest patterns idiomatic - scope='session' fixture, parametrize usage, assertion messages?
5. What's missing that a real network security engineer would add: NAT rules, app-id enforcement check, committed vs candidate config distinction, SSL decryption policy tests?
6. Is using 'type=config&action=show' reading committed or candidate config?

Post content: ---
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

## Raw output

```text
**Technical Accuracy Review**

1. **`VSYS_XPATH` is correct for a standalone default-vsys firewall.**

```python
VSYS_XPATH = '/config/devices/entry[@name="localhost.localdomain"]/vsys/entry[@name="vsys1"]'
```

That is the normal local config path for a standalone PAN-OS device using `vsys1`. PANW’s examples often shorten it to `/config/devices/entry/vsys/entry`, but the fully qualified `entry[@name="localhost.localdomain"]` form is valid. Caveat: Panorama-managed policy, multi-vsys, shared objects, templates, and device groups use different paths.

Sources: PANW XML/XPath docs and pan.dev XPath guide:
- https://docs.paloaltonetworks.com/pan-os/11-0/pan-os-panorama-api/about-the-pan-os-xml-api/structure-of-a-pan-os-xml-api-request/xml-and-xpath
- https://pan.dev/ansible/docs/panos/guides/config-xpath/

2. **`root.find(".//entry")` is too loose for `critical_rule_exists`.**

If your XPath targets one exact rule:

```python
{VSYS_XPATH}/rulebase/security/rules/entry[@name="critical-rule"]
```

then an existing rule typically returns:

```xml
<response status="success" code="19">
  <result>
    <entry name="critical-rule">...</entry>
  </result>
</response>
```

If the object is not present, PAN-OS can return an API error such as code `7` object not present. PANW documents code `7` as: object specified by XPath is not present, for example `entry[@name='value']` with no matching object.

So the test should first validate API status, then check the exact result shape:

```python
assert root.get("status") == "success", ET.tostring(root, encoding="unicode")

rule = root.find("./result/entry")
assert rule is not None and rule.get("name") == "critical-rule"
```

Using `.//entry` can accidentally match some nested `<entry>` inside the returned rule or another broader response. It works by luck when the response is exactly one rule, but it is not a precise existence check.

Source:
- https://docs.paloaltonetworks.com/ngfw/api/getting-started/pan-os-xml-api-error-codes

3. **Zone protection profile is under `network`.**

The broad lookup works:

```python
root.findtext(".//zone-protection-profile")
```

but the accurate path is:

```python
root.findtext("./result/entry/network/zone-protection-profile")
```

assuming the API call targets:

```python
f"{VSYS_XPATH}/zone/entry[@name='{zone_name}']"
```

PAN-OS zone config stores network membership and zone protection under the zone’s `<network>` subtree. I would change the blog post to say the profile is applied to the zone under `network`, and use the precise path in code.

4. **pytest usage is mostly idiomatic.**

A `scope="session"` fixture for the API client is fine. Parametrization is the right pattern for zones, required rules, naming checks, and policy expectations. Assertion messages are useful here because these are compliance/audit-style tests, even though pytest’s native assertion introspection is normally enough.

I would add:
- `pytest.skip()` if `FW_HOST` or `PANOS_KEY` is missing.
- A helper that checks PAN-OS API `status="success"` before parsing config intent.
- Test names that encode security intent, not implementation detail.
- Avoid `urllib3.disable_warnings()` in the “serious” version. For a lab post it is acceptable, but say to install/trust a certificate for production.

5. **What a network security engineer would add**

The missing checks are real. I’d add at least:

- NAT rules: inbound NAT must have matching narrow security policy; no broad source `any` unless explicitly intended; translated destination/service sanity.
- App-ID enforcement: allowed security rules should avoid `application any`; internet egress should use App-ID plus `service application-default`.
- Security profiles: allowed rules should have vulnerability, anti-spyware, URL filtering, wildfire/file-blocking, or a profile group.
- Committed vs candidate distinction: test the running config for enforced posture, optionally test candidate config before commit.
- SSL decryption policy: detect broad `no-decrypt`, verify decrypt rules for outbound user zones where intended, and validate exceptions/tags.
- Rule hygiene: disabled rules, stale temporary rules, missing descriptions/tags, log forwarding, `log-end`, overly broad source/destination/service.
- Panorama caveat: local firewall rulebase is not enough if policy comes from Panorama pre/post-rulebase.

6. **`type=config&action=show` reads active/running config, not candidate.**

This is important. PANW documents:

- `action=show` = active/running config
- `action=get` = candidate/uncommitted config

So the blog should not describe `show` as candidate config. If the goal is “what is actually enforced right now,” `show` is correct. If the goal is “will this pending commit violate policy,” use `get`.

Source:
- https://docs.paloaltonetworks.com/pan-os/11-0/pan-os-panorama-api/pan-os-xml-api-request-types/pan-os-xml-api-request-types-and-actions/configuration-actions/actions-for-reading-a-configuration

**Bottom line:** the main XPath is valid for a standalone PA-440 on `vsys1`, but the post should tighten the XML parsing, explicitly check PAN-OS API response status, fix the zone-protection path to `network/zone-protection-profile`, and clarify that `action=show` is active/running config.


OpenAI Codex v0.125.0 (research preview)
--------
workdir: /home/mareox/GIT/homelab-journal
model: gpt-5.5
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 019de490-eb71-7672-8202-4e385c92e045
--------
user
Review this blog post about pytest for PAN-OS firewall testing for TECHNICAL ACCURACY. The post uses Python 3, pytest, requests, and xml.etree.ElementTree against the PAN-OS XML API.

Check:
1. Is the XPath pattern correct? VSYS_XPATH = '/config/devices/entry[@name="localhost.localdomain"]/vsys/entry[@name="vsys1"]' - is this the right path for a standalone PAN-OS device?
2. Is 'root.find(".//entry")' the right check for the critical_rule_exists test? The XPath already targets a specific named entry - what does the response look like when the rule doesn't exist vs when it does?
3. Is 'root.findtext(".//zone-protection-profile")' the right path for zone protection profile - or is it under a 'network' subelement?
4. Are the pytest patterns idiomatic - scope='session' fixture, parametrize usage, assertion messages?
5. What's missing that a real network security engineer would add: NAT rules, app-id enforcement check, committed vs candidate config distinction, SSL decryption policy tests?
6. Is using 'type=config&action=show' reading committed or candidate config?

Post content: ---
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
2026-05-01T17:23:16.924879Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer error=\"invalid_token\", error_description=\"Missing or invalid access token\", resource_metadata=\"https://mcp.krisp.ai/.well-known/oauth-protected-resource\"" })
codex
I’ll verify this against PAN-OS XML API behavior and then assess the pytest/code patterns as a review. Since this is vendor-specific and version-sensitive, I’m checking current official docs where possible before calling out corrections.
exec
/bin/zsh -lc "sed -n '1,220p' /home/mareox/GIT/claude-config/skills/mx-panw-expert/SKILL.md" in /home/mareox/GIT/homelab-journal
 succeeded in 0ms:
---
name: mx-panw-expert
description: Use when answering Palo Alto Networks questions about PAN-OS, Prisma Access, GlobalProtect, Panorama, or NGFW - provides official documentation sources, product mappings, and research guidelines
---

# Palo Alto Networks Expert Reference

## Overview

Reference guide for researching and answering Palo Alto Networks questions. Prioritizes official documentation over community sources.

**Core principle:** Always verify answers against official PANW documentation before responding.

## When to Use

**Use this skill when:**
- Answering PAN-OS, Panorama, or NGFW questions
- Researching Prisma Access or SASE configurations
- Troubleshooting GlobalProtect VPN issues
- Looking up CLI commands or API references
- Explaining PANW security concepts

**When NOT to use:**
- Homelab-specific firewall config (use project skills instead)
- Generic networking unrelated to PANW

## Source Hierarchy

**Always check in this order:**

| Priority | Source | Use For |
|----------|--------|---------|
| 1 | [docs.paloaltonetworks.com](https://docs.paloaltonetworks.com/) | Official documentation |
| 2 | [pan.dev](https://pan.dev/) | APIs, SDKs, Terraform, Ansible |
| 3 | [live.paloaltonetworks.com](https://live.paloaltonetworks.com/) | Community troubleshooting |
| 4 | [github.com/PaloAltoNetworks](https://github.com/PaloAltoNetworks) | Official tools/scripts |
| 5 | [github.com/cdot65](https://github.com/cdot65) | Community automation |

## Product Documentation

| Product | Documentation URL |
|---------|-------------------|
| PAN-OS / NGFW | [docs.paloaltonetworks.com/pan-os](https://docs.paloaltonetworks.com/pan-os) |
| Panorama | [docs.paloaltonetworks.com/panorama](https://docs.paloaltonetworks.com/panorama) |
| Prisma Access | [docs.paloaltonetworks.com/prisma-access](https://docs.paloaltonetworks.com/prisma-access) |
| GlobalProtect | [docs.paloaltonetworks.com/globalprotect](https://docs.paloaltonetworks.com/globalprotect) |
| Cloud NGFW | [docs.paloaltonetworks.com/cloud-ngfw](https://docs.paloaltonetworks.com/cloud-ngfw) |
| Cortex XSOAR | [docs.paloaltonetworks.com/cortex/cortex-xsoar](https://docs.paloaltonetworks.com/cortex/cortex-xsoar) |
| Strata Cloud Manager | [docs.paloaltonetworks.com/strata-cloud-manager](https://docs.paloaltonetworks.com/strata-cloud-manager) |

## Developer Resources

| Resource | URL | Use For |
|----------|-----|---------|
| pan.dev | [pan.dev](https://pan.dev/) | API docs, SDKs |
| Terraform | [pan.dev/terraform](https://registry.terraform.io/providers/PaloAltoNetworks/panos/latest/docs) | Infrastructure as Code |
| Ansible | [pan.dev/ansible](https://pan.dev/ansible/) | Automation playbooks |
| Python SDK | [pan-os-python](https://pan-os-python.readthedocs.io/) | Python automation |

## Research Guidelines

1. **Start official** - Check docs.paloaltonetworks.com first
2. **Verify versions** - PAN-OS versions have different features/syntax
3. **Check release notes** - Known issues and changes
4. **Use WebFetch** - Fetch current documentation when needed
5. **Cite sources** - Include doc links in responses

## Common CLI Reference

```bash
# System
show system info
show high-availability state
request system software check

# Security
show running security-policy
test security-policy-match source <ip> destination <ip>

# Troubleshooting
show session all filter source <ip>
show counter global filter severity drop
debug dataplane packet-diag
```

## For Complex Research

Use the **panw-expert agent** for deep research:
```
Task tool → subagent_type: panw-expert
```

The agent can perform multi-step research using WebFetch and WebSearch.

codex
Using `mx-panw-expert` here because the question hinges on PAN-OS XML API structure, not just Python style. I’m prioritizing official docs and then I’ll give you review-style findings with suggested text/code changes.
web search: 
web search: site:docs.paloaltonetworks.com PAN-OS XML API config show candidate running action show get xpath
web search: 
web search: PAN-OS XML API action show xpath entry does not exist response result empty
web search: 
web search: site:docs.paloaltonetworks.com PAN-OS XML API zone-protection-profile network zone xpath
web search: 
web search: "Object doesn't exist" "PAN-OS" "action=show" "response"
web search: 
web search: https://docs.paloaltonetworks.com/pan-os/10-1/pan-os-panorama-api/get-started-with-the-pan-os-xml-api/pan-os-xml-api-error-codes
codex
**Technical Accuracy Review**

1. **`VSYS_XPATH` is correct for a standalone default-vsys firewall.**

```python
VSYS_XPATH = '/config/devices/entry[@name="localhost.localdomain"]/vsys/entry[@name="vsys1"]'
```

That is the normal local config path for a standalone PAN-OS device using `vsys1`. PANW’s examples often shorten it to `/config/devices/entry/vsys/entry`, but the fully qualified `entry[@name="localhost.localdomain"]` form is valid. Caveat: Panorama-managed policy, multi-vsys, shared objects, templates, and device groups use different paths.

Sources: PANW XML/XPath docs and pan.dev XPath guide:
- https://docs.paloaltonetworks.com/pan-os/11-0/pan-os-panorama-api/about-the-pan-os-xml-api/structure-of-a-pan-os-xml-api-request/xml-and-xpath
- https://pan.dev/ansible/docs/panos/guides/config-xpath/

2. **`root.find(".//entry")` is too loose for `critical_rule_exists`.**

If your XPath targets one exact rule:

```python
{VSYS_XPATH}/rulebase/security/rules/entry[@name="critical-rule"]
```

then an existing rule typically returns:

```xml
<response status="success" code="19">
  <result>
    <entry name="critical-rule">...</entry>
  </result>
</response>
```

If the object is not present, PAN-OS can return an API error such as code `7` object not present. PANW documents code `7` as: object specified by XPath is not present, for example `entry[@name='value']` with no matching object.

So the test should first validate API status, then check the exact result shape:

```python
assert root.get("status") == "success", ET.tostring(root, encoding="unicode")

rule = root.find("./result/entry")
assert rule is not None and rule.get("name") == "critical-rule"
```

Using `.//entry` can accidentally match some nested `<entry>` inside the returned rule or another broader response. It works by luck when the response is exactly one rule, but it is not a precise existence check.

Source:
- https://docs.paloaltonetworks.com/ngfw/api/getting-started/pan-os-xml-api-error-codes

3. **Zone protection profile is under `network`.**

The broad lookup works:

```python
root.findtext(".//zone-protection-profile")
```

but the accurate path is:

```python
root.findtext("./result/entry/network/zone-protection-profile")
```

assuming the API call targets:

```python
f"{VSYS_XPATH}/zone/entry[@name='{zone_name}']"
```

PAN-OS zone config stores network membership and zone protection under the zone’s `<network>` subtree. I would change the blog post to say the profile is applied to the zone under `network`, and use the precise path in code.

4. **pytest usage is mostly idiomatic.**

A `scope="session"` fixture for the API client is fine. Parametrization is the right pattern for zones, required rules, naming checks, and policy expectations. Assertion messages are useful here because these are compliance/audit-style tests, even though pytest’s native assertion introspection is normally enough.

I would add:
- `pytest.skip()` if `FW_HOST` or `PANOS_KEY` is missing.
- A helper that checks PAN-OS API `status="success"` before parsing config intent.
- Test names that encode security intent, not implementation detail.
- Avoid `urllib3.disable_warnings()` in the “serious” version. For a lab post it is acceptable, but say to install/trust a certificate for production.

5. **What a network security engineer would add**

The missing checks are real. I’d add at least:

- NAT rules: inbound NAT must have matching narrow security policy; no broad source `any` unless explicitly intended; translated destination/service sanity.
- App-ID enforcement: allowed security rules should avoid `application any`; internet egress should use App-ID plus `service application-default`.
- Security profiles: allowed rules should have vulnerability, anti-spyware, URL filtering, wildfire/file-blocking, or a profile group.
- Committed vs candidate distinction: test the running config for enforced posture, optionally test candidate config before commit.
- SSL decryption policy: detect broad `no-decrypt`, verify decrypt rules for outbound user zones where intended, and validate exceptions/tags.
- Rule hygiene: disabled rules, stale temporary rules, missing descriptions/tags, log forwarding, `log-end`, overly broad source/destination/service.
- Panorama caveat: local firewall rulebase is not enough if policy comes from Panorama pre/post-rulebase.

6. **`type=config&action=show` reads active/running config, not candidate.**

This is important. PANW documents:

- `action=show` = active/running config
- `action=get` = candidate/uncommitted config

So the blog should not describe `show` as candidate config. If the goal is “what is actually enforced right now,” `show` is correct. If the goal is “will this pending commit violate policy,” use `get`.

Source:
- https://docs.paloaltonetworks.com/pan-os/11-0/pan-os-panorama-api/pan-os-xml-api-request-types/pan-os-xml-api-request-types-and-actions/configuration-actions/actions-for-reading-a-configuration

**Bottom line:** the main XPath is valid for a standalone PA-440 on `vsys1`, but the post should tighten the XML parsing, explicitly check PAN-OS API response status, fix the zone-protection path to `network/zone-protection-profile`, and clarify that `action=show` is active/running config.
2026-05-01T17:24:37.726149Z ERROR codex_core::session: failed to record rollout items: thread 019de490-eb71-7672-8202-4e385c92e045 not found
tokens used
48,502

```

## Concise summary

Provider completed successfully. Review the raw output for details.

## Action items

- Review the response and extract decisions you want to apply.
- Capture follow-up implementation tasks if needed.
