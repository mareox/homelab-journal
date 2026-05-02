# codex advisor artifact

- Provider: codex
- Exit code: 0
- Created at: 2026-05-02T04:59:29.360Z

## Original task

Brainstorm enterprise angles for a blog post and LinkedIn post about pytest-based PAN-OS firewall configuration validation. The current post is framed as a homelab project. The user wants to reframe it as enterprise-grade Policy-as-Code for PAN-OS.

Current post angle: 'I tested my homelab PA-440 with pytest and found drift'
Proposed stronger angle: 'Define your company minimum security requirements as Python code, run them in CI against every PAN-OS firewall, catch drift before it becomes an incident'

Brainstorm:
1. What is the strongest enterprise framing for LinkedIn? (think: what problem does a CISO/senior SE lose sleep over?)
2. How should the article be restructured or expanded to be enterprise-credible? (what sections are missing?)
3. What's the one-line hook that stops the scroll for a senior network security engineer on LinkedIn?
4. What real-world enterprise scenarios make this tool essential? (compliance audits, PCI-DSS, SOC2, M&A firewall reviews)
5. What would make a security architect share this post with their team?

Be specific and opinionated.

## Final prompt

Brainstorm enterprise angles for a blog post and LinkedIn post about pytest-based PAN-OS firewall configuration validation. The current post is framed as a homelab project. The user wants to reframe it as enterprise-grade Policy-as-Code for PAN-OS.

Current post angle: 'I tested my homelab PA-440 with pytest and found drift'
Proposed stronger angle: 'Define your company minimum security requirements as Python code, run them in CI against every PAN-OS firewall, catch drift before it becomes an incident'

Brainstorm:
1. What is the strongest enterprise framing for LinkedIn? (think: what problem does a CISO/senior SE lose sleep over?)
2. How should the article be restructured or expanded to be enterprise-credible? (what sections are missing?)
3. What's the one-line hook that stops the scroll for a senior network security engineer on LinkedIn?
4. What real-world enterprise scenarios make this tool essential? (compliance audits, PCI-DSS, SOC2, M&A firewall reviews)
5. What would make a security architect share this post with their team?

Be specific and opinionated.

## Raw output

```text
The strongest enterprise framing is:

**Firewall policy drift is a governance problem, not a firewall problem.**

A CISO does not lose sleep over whether one PA-440 has a weird rule. They lose sleep over this:

> “We have 200 firewalls, multiple teams making changes, quarterly audits, cyber insurance attestations, PCI/SOC2 evidence requests, and no reliable way to prove every firewall still enforces our minimum security standard today.”

So the post should stop sounding like “I tested my firewall” and start sounding like:

> “I turned firewall security requirements into executable controls.”

That is the enterprise-grade angle.

**1. Strongest LinkedIn Framing**

Lead with the anxiety of control drift:

> Most companies can tell you whether their firewalls are online. Far fewer can prove every allow rule has inspection, logging, ownership, and an expiration policy.

That hits senior SEs, security architects, and CISOs because it maps directly to audit failure, breach investigation pain, and operational sprawl.

The best framing:

**Policy-as-Code for PAN-OS: codify minimum firewall standards once, run them continuously across the fleet, and fail CI when reality drifts from intent.**

Make it about:

- Continuous control validation
- Fleet-wide evidence
- Drift detection before incident/audit
- Security exceptions as explicit code
- Panorama-managed enterprise scale
- CI/CD quality gates for network security

Avoid making pytest the main character. pytest is the boring mechanism. The story is executable security governance.

**2. Article Restructure**

Current title is clever, but still homelab-coded. Stronger title options:

- **Policy-as-Code for PAN-OS: Testing Firewall Security Controls with pytest**
- **Turning PAN-OS Firewall Standards into Executable Tests**
- **Your Firewall Config Is Production Code. Test It Like Production Code.**
- **Continuous Firewall Compliance for PAN-OS with pytest and CI**

Suggested structure:

1. **The Problem: Firewall Drift Becomes Security Debt**
   Open with enterprise scale: many firewalls, many admins, temporary rules, emergency changes, inconsistent device groups, audit pressure.

2. **The Principle: Security Requirements Should Be Executable**
   “Every allow rule must log. Internet-facing rules must have inspection. Untrust zones must have zone protection. Temporary rules must expire.”

3. **The Control Catalog**
   Add a table:

   | Requirement | pytest Control |
   |---|---|
   | All allow rules log to SIEM | `test_allow_rules_have_log_forwarding` |
   | Allow rules have security profiles | `test_allow_rules_have_security_profile_group` |
   | No unrestricted internet allow | `test_no_unrestricted_allow_from_internet` |
   | Zone protection applied | `test_zone_protection_profile_applied` |
   | Temporary rules expire | `test_temporary_rules_have_expiration` |
   | Rule ownership documented | `test_rules_have_owner_tag` |

4. **Implementation: Read-Only PAN-OS API + pytest**
   Keep your existing code, but frame it as a minimal control engine.

5. **Enterprise Scale: Panorama and Device Groups**
   Expand this section significantly. Include branch firewalls, data center firewalls, cloud VM-Series, managed firewalls by serial, device groups, templates, and pre/post rules.

6. **CI/CD Workflow**
   Show three modes:
   - Nightly compliance sweep
   - Post-config-backup drift detection
   - Pre-change validation against candidate config

7. **Audit Evidence**
   This is missing and important. Show that pytest output becomes evidence: timestamped, versioned, attached to CI run, mapped to control IDs.

8. **Exception Handling**
   Enterprise credibility requires exceptions. Add an allowlist or YAML file with `reason`, `owner`, `expires`, and `ticket`.

   Example:

   ```yaml
   exceptions:
     - rule: ALLOW-Vendor-Temporary
       control: require-security-profile
       owner: network-security
       ticket: CHG-12345
       expires: 2026-06-30
       reason: Vendor migration window
   ```

9. **What This Does Not Replace**
   Say it clearly: this does not replace Panorama, Strata Cloud Manager, SIEM, vuln management, or formal firewall review. It gives you executable assertions over the controls your org says matter.

10. **Takeaways**
   Reframe around enterprise outcomes:
   - Drift becomes visible.
   - Exceptions become deliberate.
   - Audit evidence becomes automatic.
   - Minimum standards become enforceable.
   - Firewall review moves from spreadsheet to CI.

**3. Best One-Line LinkedIn Hook**

My strongest pick:

> Your firewall may be healthy, but can you prove every allow rule is inspected, logged, owned, and still required?

Other strong options:

> Monitoring tells you your firewall is up. Policy-as-Code tells you whether it is still enforcing your security standard.

> If your firewall standards live in a PDF, they are suggestions. If they live in pytest, they can fail a pipeline.

> I used pytest to turn PAN-OS firewall requirements into executable security controls.

> The scariest firewall rule is not the one that breaks production. It is the temporary allow rule everyone forgot.

For senior network security engineers, I’d use:

> Your firewall config is production code. Test it like production code.

That one is blunt, shareable, and technically legible.

**4. Enterprise Scenarios That Make This Essential**

Use these as article sections or LinkedIn bullets:

- **PCI-DSS firewall reviews:** Prove internet-facing and cardholder-data rules have logging, inspection, ownership, and documented scope.
- **SOC2 evidence:** Export CI runs showing continuous validation of network access controls.
- **M&A firewall review:** Run the same control suite against acquired PAN-OS environments to find inherited risk fast.
- **Branch firewall sprawl:** Validate hundreds of Panorama-managed branch firewalls against baseline controls.
- **Temporary vendor access:** Fail rules that lack expiration tags, ticket IDs, or restricted source/destination.
- **SIEM blind spots:** Catch allow rules that do not forward logs before incident response depends on missing telemetry.
- **Security profile gaps:** Identify allowed traffic without AV, vulnerability, URL filtering, DNS security, wildfire, or profile groups.
- **Pre-audit readiness:** Replace manual spreadsheet sampling with repeatable control evidence.
- **Change control enforcement:** Run tests after every commit, config backup, or Panorama push.
- **Zero Trust segmentation:** Validate that critical zones cannot talk broadly to each other.
- **Cloud firewall parity:** Compare VM-Series firewalls against the same baseline as physical perimeter firewalls.
- **Incident response:** After a breach, prove whether the relevant firewall controls were present at a specific point in time.

**5. What Makes a Security Architect Share It**

A security architect shares this if it gives their team a reusable pattern, not just an anecdote.

Add these:

- A “minimum viable PAN-OS control suite” table
- A Panorama fleet pattern
- A CI pipeline example
- An exception model with owners, reasons, tickets, and expiration
- A mapping from tests to compliance/control language
- Clear opinion: “Manual firewall reviews do not scale. Executable controls do.”

The share-worthy thesis:

> Stop asking engineers to remember every firewall standard during every change window. Encode the standard once, run it continuously, and make drift visible while it is still cheap to fix.

LinkedIn post shape:

```text
Most companies monitor whether their firewalls are healthy.

Fewer can answer:

- Does every allow rule forward logs to the SIEM?
- Does every internet-facing rule have inspection?
- Do temporary vendor rules expire?
- Are exceptions documented with owners and tickets?
- Do all branch firewalls match the corporate baseline?

That is not a monitoring problem.
That is a Policy-as-Code problem.

I used pytest against the PAN-OS XML API to turn firewall requirements into executable tests.

The result: a CI job that can validate live PAN-OS config, fail on drift, and produce audit evidence.

Your firewall config is production code.
Test it like production code.
```

The article should still mention the homelab PA-440, but only as the lab where the enterprise pattern was proven. The headline story should be enterprise control validation, not homelab drift.


OpenAI Codex v0.125.0 (research preview)
--------
workdir: /home/mareox/GIT/homelab-journal
model: gpt-5.5
provider: openai
approval: never
sandbox: danger-full-access
reasoning effort: none
reasoning summaries: none
session id: 019de70d-9173-7d90-b4a6-818ab1fdd634
--------
user
Brainstorm enterprise angles for a blog post and LinkedIn post about pytest-based PAN-OS firewall configuration validation. The current post is framed as a homelab project. The user wants to reframe it as enterprise-grade Policy-as-Code for PAN-OS.

Current post angle: 'I tested my homelab PA-440 with pytest and found drift'
Proposed stronger angle: 'Define your company minimum security requirements as Python code, run them in CI against every PAN-OS firewall, catch drift before it becomes an incident'

Brainstorm:
1. What is the strongest enterprise framing for LinkedIn? (think: what problem does a CISO/senior SE lose sleep over?)
2. How should the article be restructured or expanded to be enterprise-credible? (what sections are missing?)
3. What's the one-line hook that stops the scroll for a senior network security engineer on LinkedIn?
4. What real-world enterprise scenarios make this tool essential? (compliance audits, PCI-DSS, SOC2, M&A firewall reviews)
5. What would make a security architect share this post with their team?

Be specific and opinionated.
2026-05-02T04:58:40.401855Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer error=\"invalid_token\", error_description=\"Missing or invalid access token\", resource_metadata=\"https://mcp.krisp.ai/.well-known/oauth-protected-resource\"" })
codex
I’ll use the `deep-recon` skill here because you’re explicitly asking for a deeper, multi-angle brainstorm rather than a quick list.
exec
/bin/zsh -lc "sed -n '1,220p' /home/mareox/GIT/claude-config/skills/_deep-recon/SKILL.md" in /home/mareox/GIT/homelab-journal
 succeeded in 0ms:
---
name: deep-recon
description: Run extended multi-agent reconnaissance sessions. Use when asked to brainstorm deeply, explore ideas from multiple angles, or generate a structured recon document.
allowed-tools: Read, Grep, Glob, Write, Edit, WebSearch, WebFetch, Task, AskUserQuestion
user-invocable: true
---

# Deep Recon

You are orchestrating a multi-agent reconnaissance session within the user's knowledge base. Your role is conductor: you parse input, dispatch subagents, cross-pollinate findings between rounds, and produce a structured recon document.

## Session Continuations

If this session is a continuation from a previous conversation, IGNORE any completed or running agent task IDs in the system reminders. They belong to a prior invocation and are not your responsibility. Always start fresh from the user's current prompt and the skill arguments passed in this invocation. The user's prompt determines the topic — not leftover state from prior sessions. Do not call TaskOutput on pre-existing tasks. Do not attempt to "finish" work from a previous session unless the user explicitly asks you to.

## Step 1: Parse Input

From the user's prompt, determine:

1. **Topic**: The subject, question, or problem to brainstorm around
2. **Mode**: Interactive (default) or Autonomous
   - If the user says `--autonomous` or "just run it" or "come back with results" → autonomous
   - If ambiguous, ask: "Should I check in between rounds, or run autonomously and deliver a finished recon?"
3. **Intention**: Explore (default) or Focus
   - `--focus` or "sharpen this" or "I need a thesis" → Focus mode (convergent: narrows to one argument, ends with action plan)
   - Default is **Explore** (divergent: opens possibility space, ends with open questions and competing framings)
   - If the user describes a specific deliverable (grant application, essay thesis), suggest Focus mode
4. **Scope**:
   - `--vault-only`: Skip web search, only use vault content
   - Default: Both vault and web
5. **Output location**:
   - `--output <path>`: Write all output (final document + agent reports) to this directory
   - Default: `recon/` subdirectory relative to the source file's directory (or vault root if no source file)
   - Examples: `--output essays/recon/`, `--output recon/`, `--output working/my-project/recon/`
6. **Source material**: If the user references specific notes, folders, or tags, read those first
7. **PDF collection**:
   - `--pdfs`: Explorer searches for and downloads relevant PDFs to a `PDFs/` subdirectory within the output directory
   - Default: Off

## Step 2: Initial Vault Scan

Before dispatching agents, gather context:

1. **Grep** the vault for the topic's key terms (2-4 searches)
2. **Read** the top 3-5 most relevant notes found
3. Compile a **context brief**: key concepts, existing positions, related notes with paths
4. **Identify primary source URLs.** Scan the source material and context brief for URLs, website references, and project names that have web presences. Pass these to the Explorer in R1 with explicit instruction: "Fetch and read these primary sources directly. Do not rely on secondary coverage."
5. **Record the session start time.** Note the current time — you'll need it for elapsed-time metrics in the Process Log.

This context brief is shared with all subagents in round 1.

## Step 3: Run Rounds

Run 2-3 rounds. Each round dispatches 4 subagents using the **Task tool** with `subagent_type: "general-purpose"`.

### Agent Prompts

Read the agent definition files before dispatching:
- `.claude/skills/deep-recon/agents/explorer.md`
- `.claude/skills/deep-recon/agents/associator.md`
- `.claude/skills/deep-recon/agents/critic.md`
- `.claude/skills/deep-recon/agents/synthesizer.md`

### Round 1: Initial Exploration

Dispatch all 4 agents **in parallel** using the Task tool. Each agent's prompt should include:
- The topic/question
- The context brief from Step 2
- The agent's role instructions (from its definition file)
- The output file path: `recon/rN-<role>.md` (e.g., `recon/r1-explorer.md`)
- Round-specific instructions: "This is round 1. Cast a wide net."
- Explicit instruction: "Write your report to `<output path>` using the Write tool. The orchestrator reads from disk."
- If `--pdfs` is enabled, include in the Explorer's prompt: "PDF collection is enabled. See the PDF Collection section of your instructions. Save PDFs to `<output_dir>/PDFs/`. Create the directory with `mkdir -p` via Bash before downloading."

### Between Rounds

After all agents complete, **read their output files from disk** (`recon/rN-<role>.md`). Agent reports written to disk are the ground truth — they survive context crashes. Also check the Task return values as a fallback, but prefer the disk files.

**Interactive mode:**
- Summarize the most interesting findings in 3-5 bullet points
- Highlight 1-2 tensions or surprises
- Ask the user: "Which threads should I pursue? Anything to add or redirect?"
- Incorporate their response into round 2 prompts

**Autonomous mode:**
- The Synthesizer's output from round N determines round N+1's focus
- Collapse threads that are duplicates of each other
- Push distinct framings further apart — develop what makes each one different
- Identify clashes between framings; these tensions need deepening in the next round

### Metrics Persistence

After collecting each round's agent results and BEFORE any further processing, write (or update) `_metrics.md` in the recon/ output directory with:

- Per-agent token counts and elapsed times (from Task result metadata)
- Round wall-clock time (time from dispatching agents to last agent returning)
- Cumulative totals across all rounds so far

**This file survives context compaction.** If earlier context is compressed, read `_metrics.md` to recover the numbers. Do not rely on in-context memory for metrics — compaction will erase them.

Create `_metrics.md` after Round 1 completes. Update it after each subsequent round. Format:

```
# Metrics

Session start: YYYY-MM-DD HH:MM

## Round 1
- Explorer: ~XXXk tokens, X.Xm
- Associator: ~XXXk tokens, X.Xm
- Critic: ~XXXk tokens, X.Xm
- Synthesizer: ~XXXk tokens, X.Xm
- Round wall clock: X.Xm
- Round total tokens: ~XXXk

## Round 2
...

## Cumulative
- Total tokens: ~XXXk
- Total wall clock: XXm
```

### Cross-Pollination

When dispatching round 2+ agents, include in each prompt:
- A summary of ALL agents' findings from the previous round
- The Synthesizer's recommended focus areas
- In interactive mode: the user's steering input

**Anti-repetition:** Before dispatching R2+ agents, compile a "settled claims" list — the 5-8 key points that all R1 agents converged on. Include this in each agent's prompt with the instruction: "The following points are established from Round 1. Do not restate them. Build on them, challenge them, or move past them."

### Round 2: Deepening

Same 4 agents, but with updated focus:
- Explorer: Two mandates — (a) fill gaps identified by Critic and Synthesizer, (b) operational reality check: ground the abstractions in concrete cases, precedents, and constraints. If `--pdfs` is enabled, include: "Check `<output_dir>/PDFs/` for already-downloaded PDFs before downloading to avoid duplicates."
- Associator: Work connections between round 1 findings
- Critic: Stress-test the strongest emerging ideas
- Synthesizer: Refine themes, identify productive tensions

### Round 3 (Optional): Deepening

Run only if:
- Autonomous mode and Synthesizer recommends it
- Interactive mode and user requests it
- There are tensions that need more development or framings that are still underdeveloped

Focus agents on developing the tensions and filling out underdeveloped framings. Round 3 should find NEW complications, not resolve existing ones.

## Step 4: Produce Output

After the final round, produce the recon document.

### Orchestrator Role

The orchestrator does NOT write the recon document's substance. The final-round Synthesizer agent writes the complete document — including YAML frontmatter, Process Log, and all formatting — directly to the final output path on disk.

1. Dispatches the final Synthesizer with ALL agent reports from all rounds, plus the template, plus the instruction to draft AND WRITE the complete document. **Pass the final output file path** (e.g., `recon/YYYY-MM-DD-<topic-slug>.md`) and instruct the Synthesizer to write the finished document there using the Write tool. Also pass the current `_metrics.md` content so the Synthesizer can include the Process Log.
2. After the Synthesizer completes, **read the document from disk** and make light corrections only: fix broken `[[wikilinks]]`, correct factual errors, update the Process Log with final-round metrics. Do NOT rewrite arguments, reframe findings, or impose a different structure.

**Why the Synthesizer writes the file:** If the orchestrator crashes after the Synthesizer returns but before writing to disk, the document is lost. The Synthesizer writing directly to the final path ensures the substance survives. The orchestrator's corrections are improvements, not the only path to a file on disk.

### Focus Mode Override

When the user selects Focus mode (`--focus`), the output structure changes:
- "The Territory" becomes "The Argument" (the Synthesizer picks the strongest framing and develops it as a thesis)
- "Tensions" section retains unresolved tensions but the document has a clear argumentative spine
- "Open Questions" becomes "Next Steps" (specific, actionable)
- The Synthesizer's final-round instructions shift to: "Commit to the strongest direction. The user needs a thesis, not a map."

Focus mode uses the Synthesizer's existing convergent instructions (pick the strongest, name runners-up, eliminate duplicates).

### Output Location

If `--output <path>` was specified, use that directory. Otherwise, save to a `recon/` subdirectory relative to the source file's directory. If no source file was specified, save to `recon/` at the vault root.

- `--output essays/recon/` → save to `essays/recon/YYYY-MM-DD-<topic-slug>.md`
- Source is `New City Reader/nai.md`, no `--output` → save to `New City Reader/recon/YYYY-MM-DD-<topic-slug>.md`
- No source file, no `--output` → save to `recon/YYYY-MM-DD-<topic-slug>.md`

Create the output folder if it doesn't exist.

Save individual agent reports to the same folder as `rN-agentname.md` files. These are reference material, not the deliverable.

### Formatting

- Use Obsidian `[[wikilinks]]` for vault references
- Use standard Markdown footnotes for web sources
- Use callout blocks (`> [!info]`) for the process log
- Keep the main body in flowing prose, not bullet-point dumps

## Agent Model Selection

- Default: Use `sonnet` for Explorer, Associator, Critic
- Use `opus` for Synthesizer (it does the hardest integrative thinking)
- If the user requests maximum quality, use `opus` for all agents

## Important

- **Don't read the entire vault.** Use targeted Grep/Glob to find relevant notes.
- **Web search queries should be short** (1-6 words) and varied across agents.
- **Each round's agents run in parallel** — dispatch all 4 Task calls at once.
- **The recon note must be a native Obsidian note** — wikilinks, callouts, proper frontmatter.
- **Match the user's intellectual register.** Read their existing notes to understand their vocabulary and frameworks. The brainstorm should feel like their thinking extended, not generic AI output.

codex
I’m going to quickly locate the current draft or related PAN-OS validation content in the repo so the framing lands against the actual article instead of staying generic.
exec
/bin/zsh -lc 'rg --files' in /home/mareox/GIT/homelab-journal
 succeeded in 0ms:
LICENSE
final-hero.png
live-resume-wide.png
README.md
CONTENT_PLAYBOOK.md
live-blog-full.png
CLAUDE.md
live-blog.png
mockup-timeline.png
live-blog-posts.png
resume-light-hero.png
mockup-certs-footer.png
final-dark-skills.png
live-resume-dark-wide.png
final-dark-hero.png
static/apple-touch-icon.png
resume-light-reload.png
mockup-skills.png
final-dark-timeline.png
live-blog-wide.png
resume-dark-hero.png
mockup-credentials.png
final-credentials.png
static/images/banner-ai-tooling.png
static/images/banner-wiki.png
static/images/banner-posts.png
static/images/banner-security.png
static/images/banner-automation.png
static/images/banner-home.png
static/images/banner-journal.png
static/images/banner-monitoring.png
static/images/banner-tutorials.png
static/images/banner-observability.png
static/images/banner-virtualization.png
static/images/banner-infrastructure.png
static/images/banner-about.png
static/images/banner-series.png
static/images/diagram-rsyslog-flow.png
static/images/banner-networking.png
static/favicon-16x16.png
static/favicon-32x32.png
resume-light-full.png
resume-full-visible.png
final-dark-skilltags.png
mockup-hero.png
docs/superpowers/plans/2026-04-24-resume-visual-identity.md
scripts/sanitize.js
scripts/seo-enhance.js
scripts/create-pr.js
scripts/analyze-commits.js
scripts/sanitize.sh
scripts/validate-content.js
prisma-airs-hero.png
live-blog-article.png
mockup-projects2.png
prisma-airs-full.png
docs/superpowers/specs/2026-04-24-resume-visual-identity-design.md
resume-voice-injection.png
_c-docs/SITE_IMPROVEMENTS.md
mockup-projects.png
mockup-ai-section.png
live-resume-dark-footer.png
final-dark-certs.png
_planning/automated-tracking-plan.md
assets/css/schemes/homelab.css
assets/css/custom.css
live-resume.png
config/_default/markup.toml
config/_default/menus.en.toml
config/_default/params.toml
config/_default/languages.en.toml
resume-light-test.png
config/_default/hugo.toml
content/journal/2026-01-25-semaphore-proxmox-power/semaphore-power-dashboard.png
content/journal/2026-01-25-semaphore-proxmox-power/index.md
content/journal/2026-01-27-graylog-jvm-heap.md
content/journal/2026-01-23-semaphore-caddy-playbooks.md
content/journal/2026-01-26-graylog-upgrade.md
content/journal/_index.md
content/journal/2026-01-25-watchtower-discord-embeds.md
content/series/_index.md
archetypes/tutorial.md
archetypes/wiki.md
content/tutorials/ha-pihole-keepalived-vrrp/discord-keepalived.png
content/tutorials/ha-pihole-keepalived-vrrp/pihole-dashboard.png
archetypes/architecture.md
content/tutorials/ha-pihole-keepalived-vrrp/index.md
archetypes/journal.md
content/tutorials/ha-pihole-keepalived-vrrp/thumbnail.png
archetypes/lesson-learned.md
archetypes/default.md
content/posts/2026/panos-chainguard-root-store-automation/sema-templates-list.png
content/posts/2026/panos-chainguard-root-store-automation/sema-template-22.png
content/posts/2026/panos-chainguard-root-store-automation/index.md
content/posts/2026/panos-chainguard-root-store-automation/sema-inventory.png
content/posts/2026/panos-chainguard-root-store-automation/sema-environment.png
content/posts/2026/panos-chainguard-root-store-automation/thumbnail.png
content/tutorials/protecting-vaultwarden-cloudflare-proxy/index.md
content/tutorials/protecting-vaultwarden-cloudflare-proxy/architecture.svg
content/tutorials/protecting-vaultwarden-cloudflare-proxy/thumbnail.svg
content/tutorials/_index.md
content/posts/2026/proxmox-cluster-grafana-monitoring/index.md
content/posts/2026/4-layer-agentic-architecture/index.md
content/posts/2026/proxmox-cluster-grafana-monitoring/grafana-proxmox-dashboard.png
content/posts/2026/4-layer-agentic-architecture/four-layer-architecture.svg
content/posts/2026/4-layer-agentic-architecture/thumbnail.png
content/posts/2026/proxmox-cluster-grafana-monitoring/thumbnail.png
content/about/index.md
content/posts/2026/watchtower-to-wud-migration/wud-dashboard.png
content/posts/2026/watchtower-to-wud-migration/index.md
content/posts/2026/watchtower-to-wud-migration/thumbnail.png
content/posts/2026/fixing-my-blogs-readability/index.md
content/posts/2026/fixing-my-blogs-readability/thumbnail.png
content/posts/2026/wazuh-xdr-implementation-journal/wazuh-dashboard.png
content/posts/2026/wazuh-xdr-implementation-journal/index.md
content/posts/2026/wazuh-xdr-implementation-journal/thumbnail.png
content/posts/2026/graylog-jvm-heap-tuning/jvm-memory-comparison.svg
content/posts/2026/user-id-from-dhcp-panos/userid-mappings.png
content/posts/2026/graylog-jvm-heap-tuning/index.md
content/posts/2026/graylog-jvm-heap-tuning/thumbnail.png
content/posts/2026/user-id-from-dhcp-panos/traffic-logs.png
content/posts/2026/user-id-from-dhcp-panos/panos-dashboard.png
content/posts/2026/user-id-from-dhcp-panos/semaphore-schedule.png
content/posts/2026/user-id-from-dhcp-panos/index.md
content/posts/2026/user-id-from-dhcp-panos/zones-config.png
content/posts/2026/user-id-from-dhcp-panos/thumbnail.png
content/posts/2026/unified-homelab-mcp-server/safety-flow.svg
content/posts/2026/unified-homelab-mcp-server/index.md
content/posts/2026/unified-homelab-mcp-server/architecture.svg
content/posts/2026/unified-homelab-mcp-server/thumbnail.png
content/posts/2026/myspeed-migration/architecture-comparison.svg
content/posts/2026/myspeed-migration/index.md
content/posts/2026/myspeed-migration/myspeed-dashboard.png
content/posts/2026/myspeed-migration/thumbnail.png
content/wiki/networking/ha-pairs.svg
content/wiki/networking/firewall-zones.svg
content/wiki/networking/dual-proxy-design.svg
content/wiki/networking/_index.md
content/wiki/networking/dns-three-tier.svg
content/posts/2025/welcome-to-my-homelab-journal/index.md
content/posts/2025/welcome-to-my-homelab-journal/thumbnail.png
content/posts/2025/welcome-to-my-homelab-journal/infrastructure-overview.svg
content/posts/_index.md
content/_index.md
content/posts/2026/gilfoyle-vpn-cert-automation/index.md
content/posts/2026/gilfoyle-vpn-cert-automation/thumbnail.svg
content/posts/2026/gilfoyle-vpn-cert-automation/vpn-cert-expired.png
content/posts/2026/gilfoyle-vpn-cert-automation/thumbnail.png
content/posts/2026/claude-code-second-brain/index.md
content/posts/2026/claude-code-second-brain/thumbnail.png
content/posts/2026/gilfoyle-ai-network-admin/false-positive-investigation.png
content/posts/2026/gilfoyle-ai-network-admin/index.md
content/posts/2026/gilfoyle-ai-network-admin/false-positive-alert.png
content/posts/2026/gilfoyle-ai-network-admin/dns-critical-alert.png
content/posts/2026/gilfoyle-ai-network-admin/thumbnail.svg
content/posts/2026/gilfoyle-ai-network-admin/vpn-cert-expired.png
content/posts/2026/gilfoyle-ai-network-admin/thumbnail.png
content/wiki/ai-tooling/_index.md
content/posts/2026/pytest-panos-firewall-testing/index.md
content/posts/2026/pytest-panos-firewall-testing/thumbnail.png
content/posts/2026/caddy-gitops-autodeploy/gitops-deploy-pipeline.svg
content/posts/2026/caddy-gitops-autodeploy/index.md
content/posts/2026/caddy-gitops-autodeploy/semaphore-webhook.png
content/posts/2026/caddy-gitops-autodeploy/thumbnail.png
content/posts/2026/docker-safe-update-soak-period/index.md
content/posts/2026/docker-safe-update-soak-period/thumbnail.png
content/posts/2026/wazuh-xdr-graylog-integration/graylog-dashboard.png
content/posts/2026/wazuh-xdr-graylog-integration/thumbnail.png
content/posts/2026/wazuh-xdr-graylog-integration/index.md
themes/blowfish/tailwind.config.js
themes/blowfish/CONTRIBUTING.md
themes/blowfish/genLangLinks.js
themes/blowfish/README.md
themes/blowfish/README.es.md
themes/blowfish/update-github-data.sh
themes/blowfish/findMissingTranslations.js
themes/blowfish/blowfish_logo.png
themes/blowfish/package.json
themes/blowfish/static/site.webmanifest
themes/blowfish/static/apple-touch-icon.png
themes/blowfish/static/android-chrome-192x192.png
content/posts/2026/panos-cert-consolidation/index.md
themes/blowfish/static/favicon-16x16.png
content/posts/2026/panos-cert-consolidation/cert-renewal-pipeline.svg
themes/blowfish/static/android-chrome-512x512.png
content/posts/2026/panos-cert-consolidation/thumbnail.png
content/wiki/_index.md
content/homelab-overview.svg
themes/blowfish/static/favicon-32x32.png
themes/blowfish/static/favicon.ico
content/wiki/infrastructure/app-backup.svg
content/wiki/infrastructure/_index.md
content/wiki/infrastructure/pbs-backup.svg
content/wiki/infrastructure/docker-in-lxc.svg
content/wiki/infrastructure/cluster-architecture.svg
content/wiki/infrastructure/lxc-vs-docker.svg
content/wiki/infrastructure/ha-pairs.svg
content/posts/2026/automated-blog-pipeline/discord-review-bot.png
content/posts/2026/automated-blog-pipeline/github-actions-deploy.png
content/posts/2026/automated-blog-pipeline/index.md
content/posts/2026/automated-blog-pipeline/thumbnail.png
content/wiki/infrastructure/provisioning.svg
content/wiki/infrastructure/id-formula.svg
layouts/shortcodes/mermaid.html
layouts/shortcodes/network-topology.html
themes/blowfish/theme.toml
themes/blowfish/README.zh-cn.md
themes/blowfish/README.de.md
themes/blowfish/LICENSE
themes/blowfish/CODE_OF_CONDUCT.md
themes/blowfish/README.pt-br.md
themes/blowfish/README.fr.md
themes/blowfish/README.pt-pt.md
themes/blowfish/genLang.js
themes/blowfish/genArticle.js
content/wiki/automation/automation-stack.svg
themes/blowfish/logo.png
themes/blowfish/scripts/seed-firebase-views.js
content/wiki/observability/graylog-pipeline.svg
themes/blowfish/scripts/package-lock.json
themes/blowfish/scripts/package.json
themes/blowfish/README.ja.md
themes/blowfish/netlify.toml
themes/blowfish/README.id.md
themes/blowfish/lighthouserc.js
themes/blowfish/images/home-hero.png
themes/blowfish/config.toml
themes/blowfish/images/screenshot.png
themes/blowfish/images/home-page.png
themes/blowfish/images/home-card.png
themes/blowfish/images/home-mobile.png
themes/blowfish/images/home-profile.png
themes/blowfish/images/tn.png
themes/blowfish/images/home-background.png
content/wiki/observability/rsyslog-flow.svg
content/wiki/observability/alert-embed.svg
content/wiki/observability/monitoring-stack.svg
content/wiki/observability/uptime-tiers.svg
content/wiki/automation/configured-domains.svg
content/wiki/automation/portainer-gitops.svg
content/wiki/automation/iac-repos.svg
content/wiki/security/vaultwarden-traffic-flow/cloudflare-tunnel.svg
themes/blowfish/layouts/404.html
themes/blowfish/archetypes/external.md
content/wiki/security/vaultwarden-traffic-flow/index.md
content/wiki/security/vaultwarden-traffic-flow/dual-path-traffic.svg
content/wiki/security/vaultwarden-traffic-flow/thumbnail.png
themes/blowfish/exampleSite/archetypes/default.md
content/wiki/security/_index.md
themes/blowfish/release-versions/hugo-latest.txt
themes/blowfish/layouts/robots.txt
layouts/partials/footer.html
themes/blowfish/archetypes/default.md
content/wiki/observability/_index.md
content/wiki/automation/homelab-journal-architecture/content-types.svg
content/wiki/automation/homelab-journal-architecture/index.md
content/wiki/automation/homelab-journal-architecture/directory-structure.svg
content/wiki/automation/homelab-journal-architecture/content-lifecycle.svg
content/wiki/automation/n8n-architecture.svg
layouts/partials/extend-footer.html
themes/blowfish/assets/lib/chart/chart.min.js
content/wiki/automation/caddy-gitops-auto-deploy/index.md
content/wiki/automation/caddy-gitops-auto-deploy/gitops-pipeline.svg
content/wiki/automation/caddy-gitops-auto-deploy/thumbnail.png
content/wiki/automation/discord-notification.svg
content/wiki/automation/error-handling.svg
layouts/partials/home/custom.html
content/wiki/automation/_index.md
content/wiki/automation/backup-pattern.svg
layouts/partials/header/basic.html
themes/blowfish/config/_default/menus.en.toml
themes/blowfish/config/_default/params.toml
themes/blowfish/config/_default/module.toml
themes/blowfish/assets/lib/typeit/typeit.umd.js
themes/blowfish/config/_default/languages.en.toml
themes/blowfish/config/_default/hugo.toml
themes/blowfish/config/_default/markup.toml
themes/blowfish/exampleSite/config/development/hugo.toml
themes/blowfish/layouts/_default/baseof.html
themes/blowfish/layouts/_default/term.html
themes/blowfish/layouts/_default/terms.html
themes/blowfish/layouts/_default/simple.html
themes/blowfish/layouts/_default/single.html
themes/blowfish/layouts/_default/sitemap.xml
themes/blowfish/layouts/_default/rss.xml
themes/blowfish/layouts/_default/index.json
themes/blowfish/layouts/_default/list.html
themes/blowfish/exampleSite/layouts/partials/extend-footer.html
themes/blowfish/exampleSite/layouts/shortcodes/icon-ref.html
themes/blowfish/exampleSite/layouts/shortcodes/theme-switcher.html
themes/blowfish/exampleSite/layouts/partials/recent-articles-demo.html
themes/blowfish/package-lock.json
themes/blowfish/layouts/index.html
themes/blowfish/layouts/_default/_markup/render-heading.html
themes/blowfish/layouts/_default/_markup/render-blockquote.html
themes/blowfish/layouts/_default/_markup/render-link.html
themes/blowfish/layouts/_default/_markup/render-codeblock.html
themes/blowfish/layouts/_default/_markup/render-image.html
themes/blowfish/exampleSite/config/_default/languages.pt-pt.toml
themes/blowfish/exampleSite/config/_default/languages.de.toml
themes/blowfish/exampleSite/config/_default/menus.en.toml
themes/blowfish/exampleSite/config/_default/menus.pt-pt.toml
themes/blowfish/exampleSite/config/_default/menus.fr.toml
themes/blowfish/exampleSite/config/_default/params.toml
themes/blowfish/exampleSite/config/_default/languages.es.toml
themes/blowfish/exampleSite/config/_default/languages.it.toml
themes/blowfish/exampleSite/config/_default/menus.zh-cn.toml
themes/blowfish/exampleSite/config/_default/menus.pt-br.toml
themes/blowfish/exampleSite/config/_default/menus.it.toml
themes/blowfish/exampleSite/config/_default/languages.en.toml
themes/blowfish/exampleSite/config/_default/languages.pt-br.toml
themes/blowfish/exampleSite/config/_default/menus.de.toml
themes/blowfish/exampleSite/config/_default/languages.ja.toml
themes/blowfish/exampleSite/config/_default/menus.es.toml
themes/blowfish/exampleSite/config/_default/hugo.toml
themes/blowfish/exampleSite/config/_default/languages.zh-cn.toml
themes/blowfish/exampleSite/config/_default/languages.fr.toml
themes/blowfish/exampleSite/config/_default/menus.ja.toml
themes/blowfish/exampleSite/config/_default/markup.toml
themes/blowfish/layouts/partials/head.html
themes/blowfish/layouts/partials/scroll-to-top.html
themes/blowfish/layouts/partials/init.html
themes/blowfish/exampleSite/data/authors/secondauthor.json
themes/blowfish/exampleSite/content/_index.pt-br.md
themes/blowfish/exampleSite/data/authors/nunocoracao.json
themes/blowfish/assets/lib/fuse/fuse.min.js
themes/blowfish/layouts/shortcodes/chart.html
themes/blowfish/layouts/shortcodes/keywordList.html
themes/blowfish/layouts/shortcodes/gist.html
themes/blowfish/layouts/shortcodes/ltr.html
themes/blowfish/layouts/shortcodes/icon.html
themes/blowfish/layouts/shortcodes/gallery.html
themes/blowfish/layouts/shortcodes/timeline.html
themes/blowfish/layouts/shortcodes/codeberg.html
themes/blowfish/layouts/shortcodes/keyword.html
themes/blowfish/layouts/shortcodes/katex.html
themes/blowfish/layouts/shortcodes/video.html
themes/blowfish/layouts/shortcodes/lead.html
themes/blowfish/layouts/shortcodes/mermaid.html
themes/blowfish/go.mod
themes/blowfish/FUNDING.yml
themes/blowfish/processUsers.js
themes/blowfish/layouts/shortcodes/list.html
themes/blowfish/layouts/shortcodes/swatches.html
themes/blowfish/layouts/shortcodes/gitlab.html
themes/blowfish/layouts/shortcodes/timelineItem.html
themes/blowfish/layouts/shortcodes/badge.html
themes/blowfish/layouts/shortcodes/alert.html
themes/blowfish/layouts/shortcodes/carousel.html
themes/blowfish/layouts/shortcodes/tabs.html
themes/blowfish/layouts/shortcodes/button.html
themes/blowfish/layouts/shortcodes/forgejo.html
themes/blowfish/layouts/shortcodes/rtl.html
themes/blowfish/layouts/shortcodes/github.html
themes/blowfish/assets/lib/tw-elements/index.min.js
content/wiki/observability/prometheus-grafana-dedicated-lxc/before-after-migration.svg
content/wiki/observability/prometheus-grafana-dedicated-lxc/index.md
content/wiki/observability/prometheus-grafana-dedicated-lxc/monitoring-architecture.svg
themes/blowfish/layouts/shortcodes/tab.html
themes/blowfish/layouts/shortcodes/mdimporter.html
themes/blowfish/layouts/shortcodes/youtubeLite.html
themes/blowfish/layouts/shortcodes/accordion.html
themes/blowfish/layouts/shortcodes/huggingface.html
themes/blowfish/layouts/shortcodes/figure.html
themes/blowfish/layouts/shortcodes/codeimporter.html
themes/blowfish/layouts/shortcodes/screenshot.html
themes/blowfish/layouts/shortcodes/article.html
themes/blowfish/layouts/shortcodes/typeit.html
themes/blowfish/layouts/shortcodes/gitea.html
themes/blowfish/layouts/shortcodes/accordionItem.html
themes/blowfish/layouts/partials/hugo-embedded/shortcodes/figure-default.html
themes/blowfish/layouts/partials/sponsors.html
themes/blowfish/layouts/partials/icon.html
themes/blowfish/layouts/partials/search.html
themes/blowfish/layouts/partials/author-extra.html
themes/blowfish/exampleSite/assets/img/author2.png
themes/blowfish/exampleSite/assets/img/iceland.jpg
themes/blowfish/exampleSite/assets/img/ocean.jpg
themes/blowfish/exampleSite/assets/img/blowfish.jpg
themes/blowfish/exampleSite/assets/img/paint.png
themes/blowfish/exampleSite/assets/img/nuno_avatar.jpg
themes/blowfish/exampleSite/assets/img/bg.jpg
themes/blowfish/assets/lib/zoom/zoom.min.umd.js
themes/blowfish/assets/lib/zoom/style.css
themes/blowfish/exampleSite/content/_index.es.md
themes/blowfish/exampleSite/content/_index.pt-pt.md
themes/blowfish/assets/lib/mermaid/mermaid.min.js
themes/blowfish/i18n/fi.yaml
themes/blowfish/i18n/en.yaml
themes/blowfish/i18n/hu.yaml
themes/blowfish/i18n/tr.yaml
themes/blowfish/i18n/he.yaml
themes/blowfish/i18n/de.yaml
themes/blowfish/i18n/pt-PT.yaml
themes/blowfish/i18n/zh-TW.yaml
themes/blowfish/i18n/pl.yaml
themes/blowfish/i18n/nl.yaml
themes/blowfish/i18n/ca.yaml
themes/blowfish/i18n/zh-CN.yaml
themes/blowfish/i18n/ar.yaml
themes/blowfish/i18n/pt-BR.yaml
themes/blowfish/i18n/bg.yaml
themes/blowfish/i18n/vi.yaml
themes/blowfish/i18n/cs.yaml
themes/blowfish/i18n/da.yaml
themes/blowfish/i18n/it.yaml
themes/blowfish/i18n/ja.yaml
themes/blowfish/i18n/uk.yaml
themes/blowfish/i18n/th.yaml
themes/blowfish/i18n/sv.yaml
themes/blowfish/i18n/bn.yaml
themes/blowfish/i18n/ru.yaml
themes/blowfish/i18n/ro.yaml
themes/blowfish/i18n/gl.yaml
themes/blowfish/i18n/eo.yaml
themes/blowfish/i18n/es.yaml
themes/blowfish/exampleSite/assets/js/home.js
themes/blowfish/i18n/fr.yaml
themes/blowfish/i18n/ko.yaml
themes/blowfish/i18n/hr.yaml
themes/blowfish/i18n/fa.yaml
themes/blowfish/i18n/id.yaml
themes/blowfish/assets/js/search.js
themes/blowfish/assets/js/print-support.js
themes/blowfish/assets/js/a11y.js
themes/blowfish/assets/js/rtl.js
themes/blowfish/exampleSite/content/_index.md
themes/blowfish/assets/js/fetch-repo.js
themes/blowfish/exampleSite/content/_index.it.md
themes/blowfish/assets/js/firebase.js
themes/blowfish/assets/js/katex-render.js
themes/blowfish/assets/js/scroll-to-top.js
themes/blowfish/assets/js/zen-mode.js
themes/blowfish/exampleSite/layouts/partials/home/custom.html
themes/blowfish/layouts/partials/schema.html
themes/blowfish/assets/lib/packery/packery.pkgd.min.js
themes/blowfish/assets/img/rain.svg
themes/blowfish/layouts/partials/home/page.html
themes/blowfish/layouts/partials/home/hero.html
themes/blowfish/layouts/partials/home/background.html
themes/blowfish/layouts/partials/home/profile.html
themes/blowfish/layouts/partials/home/card.html
themes/blowfish/layouts/partials/breadcrumbs.html
themes/blowfish/layouts/partials/vendor.html
themes/blowfish/assets/js/shortcodes/tabs.js
themes/blowfish/assets/img/featured.svg
themes/blowfish/layouts/partials/article-meta/term.html
themes/blowfish/assets/js/shortcodes/gallery.js
themes/blowfish/assets/img/lavalamp.svg
themes/blowfish/layouts/partials/article-meta/list.html
themes/blowfish/assets/img/traffic.svg
themes/blowfish/layouts/partials/article-meta/basic.html
themes/blowfish/assets/img/fireflies.svg
themes/blowfish/layouts/partials/article-meta/taxonomy.html
themes/blowfish/assets/img/ripples.svg
themes/blowfish/assets/js/background-blur.js
themes/blowfish/assets/img/blowfish_logo.png
themes/blowfish/assets/img/blowfish_logo_transparent.png
themes/blowfish/assets/img/background.svg
themes/blowfish/assets/js/appearance.js
themes/blowfish/assets/img/blowfish_banner_transparent.png
themes/blowfish/assets/js/chart.js
themes/blowfish/assets/img/waves.svg
themes/blowfish/assets/js/mermaid.js
themes/blowfish/assets/js/code.js
themes/blowfish/layouts/partials/sharing-links.html
themes/blowfish/layouts/partials/related.html
themes/blowfish/assets/lib/lite-youtube-embed/lite-yt-embed.js
themes/blowfish/assets/lib/lite-youtube-embed/lite-yt-embed.css
themes/blowfish/assets/img/blowfish_banner.png
themes/blowfish/assets/icons/tiktok.svg
themes/blowfish/assets/icons/edit.svg
themes/blowfish/assets/icons/steam.svg
themes/blowfish/assets/icons/ko-fi.svg
themes/blowfish/assets/icons/a11y.svg
themes/blowfish/assets/icons/dev.svg
themes/blowfish/layouts/partials/badge.html
themes/blowfish/assets/icons/xing.svg
themes/blowfish/assets/icons/cloud-moon.svg
themes/blowfish/assets/icons/whatsapp.svg
themes/blowfish/assets/icons/signal.svg
themes/blowfish/assets/icons/gitlab.svg
themes/blowfish/assets/icons/fork.svg
themes/blowfish/assets/icons/triangle-exclamation.svg
themes/blowfish/assets/icons/kickstarter.svg
themes/blowfish/assets/icons/x-twitter.svg
themes/blowfish/assets/icons/code.svg
themes/blowfish/assets/icons/expand.svg
themes/blowfish/assets/icons/line.svg
themes/blowfish/assets/icons/orcid.svg
themes/blowfish/assets/icons/circle-info.svg
themes/blowfish/assets/icons/link.svg
themes/blowfish/assets/icons/language.svg
themes/blowfish/assets/icons/lastfm.svg
themes/blowfish/assets/icons/circle-question.svg
themes/blowfish/assets/icons/mastodon.svg
themes/blowfish/assets/icons/music.svg
themes/blowfish/assets/icons/hackernews.svg
themes/blowfish/assets/icons/researchgate.svg
themes/blowfish/assets/icons/lock.svg
themes/blowfish/assets/icons/location-dot.svg
themes/blowfish/assets/icons/search.svg
themes/blowfish/assets/icons/bell.svg
themes/blowfish/exampleSite/content/samples/_index.pt-br.md
themes/blowfish/assets/icons/mug-hot.svg
themes/blowfish/assets/icons/facebook.svg
themes/blowfish/assets/icons/shield.svg
themes/blowfish/assets/icons/keybase.svg
themes/blowfish/assets/icons/bluesky.svg
themes/blowfish/assets/icons/codepen.svg
themes/blowfish/data/sharing.json
themes/blowfish/assets/icons/comment.svg
themes/blowfish/assets/icons/moon.svg
themes/blowfish/data/repoColors.json
themes/blowfish/assets/icons/star.svg
themes/blowfish/data/sponsors.json
themes/blowfish/assets/icons/itch-io.svg
themes/blowfish/data/contributors.json
themes/blowfish/assets/icons/bars.svg
themes/blowfish/assets/icons/fediverse.svg
themes/blowfish/assets/icons/envelope.svg
themes/blowfish/assets/icons/paypal.svg
themes/blowfish/assets/icons/sun.svg
themes/blowfish/assets/icons/phone.svg
themes/blowfish/assets/icons/discourse.svg
themes/blowfish/assets/icons/google-scholar.svg
themes/blowfish/assets/icons/codeberg.svg
themes/blowfish/assets/icons/tag.svg
themes/blowfish/assets/icons/forgejo.svg
themes/blowfish/assets/icons/cloud.svg
themes/blowfish/assets/icons/substack.svg
themes/blowfish/assets/icons/xmark.svg
themes/blowfish/assets/icons/scale-balanced.svg
themes/blowfish/assets/icons/list-check.svg
themes/blowfish/assets/icons/heart.svg
themes/blowfish/assets/icons/keyoxide.svg
themes/blowfish/assets/icons/flickr.svg
themes/blowfish/assets/icons/blogger.svg
themes/blowfish/assets/icons/graduation-cap.svg
themes/blowfish/assets/icons/goodreads.svg
themes/blowfish/assets/icons/slack.svg
themes/blowfish/assets/icons/email.svg
themes/blowfish/assets/icons/hashnode.svg
themes/blowfish/assets/icons/file-lines.svg
themes/blowfish/assets/icons/wand-magic-sparkles.svg
themes/blowfish/assets/icons/worktree.svg
themes/blowfish/assets/icons/github.svg
themes/blowfish/assets/icons/spotify.svg
themes/blowfish/assets/icons/lightbulb.svg
themes/blowfish/assets/icons/globe.svg
themes/blowfish/assets/icons/list.svg
themes/blowfish/layouts/partials/pagination.html
themes/blowfish/assets/icons/rss-square.svg
themes/blowfish/assets/lib/katex/katex.min.css
themes/blowfish/layouts/partials/article-pagination.html
themes/blowfish/layouts/partials/functions/uid.html
themes/blowfish/layouts/partials/functions/date.html
themes/blowfish/layouts/partials/header/fixed.html
themes/blowfish/layouts/partials/header/fixed-fill.html
themes/blowfish/layouts/partials/header/fixed-fill-blur.html
themes/blowfish/layouts/partials/header/fixed-gradient.html
themes/blowfish/assets/lib/katex/katex.min.js
themes/blowfish/assets/lib/katex/auto-render.min.js
themes/blowfish/layouts/partials/analytics/fathom.html
themes/blowfish/layouts/partials/analytics/umami.html
themes/blowfish/layouts/partials/analytics/ga.html
themes/blowfish/layouts/partials/analytics/seline.html
themes/blowfish/layouts/partials/analytics/main.html
themes/blowfish/layouts/partials/author.html
themes/blowfish/layouts/partials/header/basic.html
themes/blowfish/layouts/partials/contributors.html
themes/blowfish/layouts/partials/toc.html
themes/blowfish/layouts/partials/author-links.html
themes/blowfish/exampleSite/content/tags/advanced/_index.md
themes/blowfish/exampleSite/content/tags/advanced/_index.it.md
themes/blowfish/exampleSite/content/tags/_index.ja.md
themes/blowfish/exampleSite/content/tags/_index.zh-cn.md
themes/blowfish/exampleSite/content/tags/_index.md
themes/blowfish/exampleSite/content/tags/_index.it.md
themes/blowfish/exampleSite/content/tags/advanced/featured.png
themes/blowfish/exampleSite/content/tags/advanced/_index.es.md
themes/blowfish/exampleSite/content/tags/advanced/_index.pt-pt.md
themes/blowfish/exampleSite/content/tags/advanced/_index.zh-cn.md
themes/blowfish/exampleSite/content/tags/advanced/_index.de.md
themes/blowfish/exampleSite/content/tags/advanced/_index.ja.md
themes/blowfish/layouts/partials/series/series-closed.html
themes/blowfish/layouts/partials/series/series_base.html
themes/blowfish/layouts/partials/series/series.html
themes/blowfish/layouts/partials/footer.html
themes/blowfish/exampleSite/content/tags/advanced/_index.pt-br.md
themes/blowfish/exampleSite/content/tags/advanced/_index.fr.md
themes/blowfish/exampleSite/content/samples/placeholder-text/index.pt-br.md
themes/blowfish/exampleSite/content/samples/placeholder-text/index.md
themes/blowfish/exampleSite/content/samples/placeholder-text/index.de.md
themes/blowfish/exampleSite/content/samples/placeholder-text/index.es.md
themes/blowfish/exampleSite/content/samples/placeholder-text/index.ja.md
themes/blowfish/exampleSite/content/samples/placeholder-text/index.it.md
themes/blowfish/exampleSite/content/samples/placeholder-text/index.fr.md
themes/blowfish/exampleSite/content/samples/placeholder-text/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/placeholder-text/index.zh-cn.md
themes/blowfish/layouts/partials/header/components/a11y.html
themes/blowfish/layouts/partials/header/components/mobile-menu.html
themes/blowfish/layouts/partials/header/components/translations.html
themes/blowfish/layouts/partials/header/components/desktop-menu.html
themes/blowfish/layouts/partials/hero/background.html
themes/blowfish/layouts/partials/hero/basic.html
themes/blowfish/layouts/partials/hero/big.html
themes/blowfish/layouts/partials/hero/thumbAndBackground.html
themes/blowfish/layouts/partials/meta/word-count.html
themes/blowfish/layouts/partials/meta/edit.html
themes/blowfish/layouts/partials/meta/likes_button.html
themes/blowfish/layouts/partials/meta/date.html
themes/blowfish/layouts/partials/meta/reading-time.html
themes/blowfish/layouts/partials/meta/views.html
themes/blowfish/layouts/partials/meta/date-updated.html
themes/blowfish/layouts/partials/meta/likes.html
themes/blowfish/layouts/partials/meta/zen-mode.html
themes/blowfish/assets/css/compiled/main.css
themes/blowfish/layouts/partials/impls/hooks/admonition-maps.html
themes/blowfish/layouts/partials/recent-articles/cardview-fullwidth.html
themes/blowfish/layouts/partials/recent-articles/cardview.html
themes/blowfish/layouts/partials/recent-articles/list.html
themes/blowfish/layouts/partials/recent-articles/main.html
themes/blowfish/assets/icons/youtube.svg
themes/blowfish/assets/icons/tumblr.svg
themes/blowfish/assets/icons/pinterest.svg
themes/blowfish/assets/icons/bomb.svg
themes/blowfish/assets/icons/image.svg
themes/blowfish/assets/icons/quote-left.svg
themes/blowfish/assets/icons/poo.svg
themes/blowfish/assets/icons/gitea.svg
themes/blowfish/assets/icons/stripe.svg
themes/blowfish/assets/icons/heart-empty.svg
themes/blowfish/assets/icons/matrix.svg
themes/blowfish/assets/icons/telegram.svg
themes/blowfish/assets/icons/apple.svg
themes/blowfish/assets/icons/download.svg
themes/blowfish/assets/icons/linkedin.svg
themes/blowfish/assets/icons/patreon.svg
themes/blowfish/assets/icons/docker.svg
themes/blowfish/assets/icons/eye.svg
themes/blowfish/assets/icons/amazon.svg
themes/blowfish/assets/icons/instagram.svg
themes/blowfish/assets/icons/pixelfed.svg
themes/blowfish/assets/icons/threads.svg
themes/blowfish/assets/icons/chevron-down.svg
themes/blowfish/assets/icons/fire.svg
themes/blowfish/assets/icons/medium.svg
themes/blowfish/assets/icons/google.svg
themes/blowfish/assets/icons/pencil.svg
themes/blowfish/assets/icons/rss.svg
themes/blowfish/assets/icons/bug.svg
themes/blowfish/assets/icons/discord.svg
themes/blowfish/assets/icons/twitter.svg
themes/blowfish/assets/icons/skull-crossbones.svg
themes/blowfish/assets/icons/snapchat.svg
themes/blowfish/assets/icons/dribbble.svg
themes/blowfish/assets/icons/reddit.svg
themes/blowfish/assets/icons/foursquare.svg
themes/blowfish/assets/icons/soundcloud.svg
themes/blowfish/assets/icons/list-ol.svg
themes/blowfish/assets/icons/ghost.svg
themes/blowfish/assets/icons/peertube.svg
themes/blowfish/assets/icons/check.svg
themes/blowfish/assets/icons/stack-overflow.svg
themes/blowfish/assets/icons/pgpkey.svg
themes/blowfish/assets/icons/microsoft.svg
themes/blowfish/assets/icons/twitch.svg
themes/blowfish/assets/css/components/zen-mode.css
themes/blowfish/assets/css/components/gallery.css
themes/blowfish/assets/css/components/a11y.css
themes/blowfish/assets/css/components/admonition.css
themes/blowfish/assets/css/components/chroma.css
themes/blowfish/assets/css/components/tabs.css
themes/blowfish/assets/css/components/carousel.css
themes/blowfish/assets/css/main.css
themes/blowfish/assets/css/schemes/one-light.css
themes/blowfish/assets/css/schemes/bloody.css
themes/blowfish/assets/css/schemes/princess.css
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size3-Regular.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Caligraphic-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-Regular.woff
themes/blowfish/exampleSite/content/samples/mathematical-notation/index.pt-br.md
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size2-Regular.woff
themes/blowfish/exampleSite/content/samples/mathematical-notation/index.md
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-Regular.ttf
themes/blowfish/exampleSite/content/samples/mathematical-notation/index.de.md
themes/blowfish/exampleSite/content/samples/mathematical-notation/index.es.md
themes/blowfish/exampleSite/content/samples/mathematical-notation/index.ja.md
themes/blowfish/exampleSite/content/samples/mathematical-notation/index.it.md
themes/blowfish/exampleSite/content/samples/mathematical-notation/index.fr.md
themes/blowfish/exampleSite/content/samples/mathematical-notation/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/mathematical-notation/index.zh-cn.md
themes/blowfish/exampleSite/content/samples/_index.fr.md
themes/blowfish/exampleSite/content/samples/_index.ja.md
themes/blowfish/exampleSite/content/samples/_index.zh-cn.md
themes/blowfish/exampleSite/content/users/60-d965f981aa39336ef7be5efac83c96b2/index.pt-br.md
themes/blowfish/exampleSite/content/users/60-d965f981aa39336ef7be5efac83c96b2/index.md
themes/blowfish/exampleSite/content/users/60-d965f981aa39336ef7be5efac83c96b2/index.de.md
themes/blowfish/exampleSite/content/users/60-d965f981aa39336ef7be5efac83c96b2/index.es.md
themes/blowfish/exampleSite/content/users/60-d965f981aa39336ef7be5efac83c96b2/index.ja.md
themes/blowfish/exampleSite/content/users/60-d965f981aa39336ef7be5efac83c96b2/index.it.md
themes/blowfish/exampleSite/content/users/60-d965f981aa39336ef7be5efac83c96b2/index.fr.md
themes/blowfish/exampleSite/content/users/60-d965f981aa39336ef7be5efac83c96b2/index.pt-pt.md
themes/blowfish/exampleSite/content/users/60-d965f981aa39336ef7be5efac83c96b2/feature.webp
themes/blowfish/exampleSite/content/users/60-d965f981aa39336ef7be5efac83c96b2/index.zh-cn.md
themes/blowfish/layouts/partials/term-link/text.html
themes/blowfish/layouts/partials/term-link/card.html
themes/blowfish/layouts/partials/article-link/_shortcode.html
themes/blowfish/layouts/partials/article-link/card.html
themes/blowfish/layouts/partials/article-link/simple.html
themes/blowfish/layouts/partials/article-link/card-related.html
themes/blowfish/exampleSite/content/users/37-d9e559aaa0c3488012725cc4699ff9c4/index.pt-br.md
themes/blowfish/exampleSite/content/users/37-d9e559aaa0c3488012725cc4699ff9c4/index.md
themes/blowfish/exampleSite/content/users/37-d9e559aaa0c3488012725cc4699ff9c4/index.de.md
themes/blowfish/exampleSite/content/users/37-d9e559aaa0c3488012725cc4699ff9c4/index.es.md
themes/blowfish/exampleSite/content/users/37-d9e559aaa0c3488012725cc4699ff9c4/index.ja.md
themes/blowfish/exampleSite/content/users/72-ad989702a19d1fd8add147d6771c6c02/index.pt-br.md
themes/blowfish/exampleSite/content/users/37-d9e559aaa0c3488012725cc4699ff9c4/index.it.md
themes/blowfish/exampleSite/content/users/37-d9e559aaa0c3488012725cc4699ff9c4/index.fr.md
themes/blowfish/exampleSite/content/users/72-ad989702a19d1fd8add147d6771c6c02/index.md
themes/blowfish/exampleSite/content/users/37-d9e559aaa0c3488012725cc4699ff9c4/index.pt-pt.md
themes/blowfish/exampleSite/content/users/72-ad989702a19d1fd8add147d6771c6c02/index.de.md
themes/blowfish/exampleSite/content/users/37-d9e559aaa0c3488012725cc4699ff9c4/feature.webp
themes/blowfish/exampleSite/content/users/72-ad989702a19d1fd8add147d6771c6c02/index.es.md
themes/blowfish/exampleSite/content/users/37-d9e559aaa0c3488012725cc4699ff9c4/index.zh-cn.md
themes/blowfish/exampleSite/content/users/72-ad989702a19d1fd8add147d6771c6c02/index.ja.md
themes/blowfish/exampleSite/content/users/72-ad989702a19d1fd8add147d6771c6c02/index.it.md
themes/blowfish/exampleSite/content/users/72-ad989702a19d1fd8add147d6771c6c02/index.fr.md
themes/blowfish/exampleSite/content/users/108-850f485eb8e81e2873f1a285e3eb0b1d/index.pt-br.md
themes/blowfish/exampleSite/content/users/72-ad989702a19d1fd8add147d6771c6c02/index.pt-pt.md
themes/blowfish/exampleSite/content/users/108-850f485eb8e81e2873f1a285e3eb0b1d/index.md
themes/blowfish/exampleSite/content/users/72-ad989702a19d1fd8add147d6771c6c02/feature.webp
themes/blowfish/exampleSite/content/users/108-850f485eb8e81e2873f1a285e3eb0b1d/index.de.md
themes/blowfish/exampleSite/content/users/108-850f485eb8e81e2873f1a285e3eb0b1d/index.es.md
themes/blowfish/exampleSite/content/users/108-850f485eb8e81e2873f1a285e3eb0b1d/index.ja.md
themes/blowfish/exampleSite/content/users/72-ad989702a19d1fd8add147d6771c6c02/index.zh-cn.md
themes/blowfish/exampleSite/content/users/108-850f485eb8e81e2873f1a285e3eb0b1d/index.it.md
themes/blowfish/exampleSite/content/users/108-850f485eb8e81e2873f1a285e3eb0b1d/index.fr.md
themes/blowfish/assets/css/schemes/terminal.css
themes/blowfish/exampleSite/content/users/108-850f485eb8e81e2873f1a285e3eb0b1d/index.pt-pt.md
themes/blowfish/assets/css/schemes/marvel.css
themes/blowfish/exampleSite/content/users/108-850f485eb8e81e2873f1a285e3eb0b1d/feature.webp
themes/blowfish/exampleSite/content/users/_index.pt-pt.md
themes/blowfish/exampleSite/content/users/108-850f485eb8e81e2873f1a285e3eb0b1d/index.zh-cn.md
themes/blowfish/exampleSite/content/users/users.json
themes/blowfish/assets/css/schemes/github.css
themes/blowfish/assets/css/schemes/neon.css
themes/blowfish/assets/css/schemes/congo.css
themes/blowfish/assets/css/schemes/autumn.css
themes/blowfish/assets/css/schemes/avocado.css
themes/blowfish/assets/css/schemes/slate.css
themes/blowfish/assets/css/schemes/fire.css
themes/blowfish/assets/css/schemes/noir.css
themes/blowfish/assets/css/schemes/blowfish.css
themes/blowfish/assets/css/schemes/forest.css
themes/blowfish/assets/css/schemes/ocean.css
themes/blowfish/assets/lib/katex/fonts/KaTeX_Fraktur-Bold.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-Italic.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_SansSerif-Italic.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size1-Regular.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-BoldItalic.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Caligraphic-Bold.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-Bold.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size4-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size2-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_SansSerif-Bold.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-Bold.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Typewriter-Regular.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_SansSerif-Bold.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Math-BoldItalic.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Typewriter-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-Italic.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Fraktur-Regular.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Script-Regular.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size1-Regular.woff
themes/blowfish/exampleSite/content/users/2-4bc0917e04c4859cedb32a48bff27846/index.pt-br.md
themes/blowfish/exampleSite/content/users/2-4bc0917e04c4859cedb32a48bff27846/index.md
themes/blowfish/exampleSite/content/users/2-4bc0917e04c4859cedb32a48bff27846/index.de.md
themes/blowfish/exampleSite/content/users/2-4bc0917e04c4859cedb32a48bff27846/index.es.md
themes/blowfish/exampleSite/content/users/2-4bc0917e04c4859cedb32a48bff27846/index.ja.md
themes/blowfish/exampleSite/content/users/2-4bc0917e04c4859cedb32a48bff27846/index.it.md
themes/blowfish/exampleSite/content/users/2-4bc0917e04c4859cedb32a48bff27846/index.fr.md
themes/blowfish/exampleSite/content/users/2-4bc0917e04c4859cedb32a48bff27846/index.pt-pt.md
themes/blowfish/exampleSite/content/users/2-4bc0917e04c4859cedb32a48bff27846/feature.webp
themes/blowfish/exampleSite/content/users/2-4bc0917e04c4859cedb32a48bff27846/index.zh-cn.md
themes/blowfish/exampleSite/content/users/_index.md
themes/blowfish/exampleSite/content/samples/markdown/index.pt-br.md
themes/blowfish/exampleSite/content/samples/markdown/index.md
themes/blowfish/exampleSite/content/samples/markdown/index.de.md
themes/blowfish/exampleSite/content/samples/markdown/index.es.md
themes/blowfish/exampleSite/content/samples/markdown/index.ja.md
themes/blowfish/exampleSite/content/samples/markdown/index.it.md
themes/blowfish/exampleSite/content/samples/markdown/index.fr.md
themes/blowfish/exampleSite/content/samples/markdown/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/markdown/index.zh-cn.md
themes/blowfish/exampleSite/content/samples/_index.de.md
themes/blowfish/exampleSite/content/users/83-706590b7d6a58b77f0eadb22b1dc6cd5/index.pt-br.md
themes/blowfish/exampleSite/content/users/83-706590b7d6a58b77f0eadb22b1dc6cd5/index.md
themes/blowfish/exampleSite/content/users/83-706590b7d6a58b77f0eadb22b1dc6cd5/index.de.md
themes/blowfish/exampleSite/content/users/83-706590b7d6a58b77f0eadb22b1dc6cd5/index.es.md
themes/blowfish/exampleSite/content/users/83-706590b7d6a58b77f0eadb22b1dc6cd5/index.ja.md
themes/blowfish/exampleSite/content/users/83-706590b7d6a58b77f0eadb22b1dc6cd5/index.it.md
themes/blowfish/exampleSite/content/users/83-706590b7d6a58b77f0eadb22b1dc6cd5/index.fr.md
themes/blowfish/exampleSite/content/users/83-706590b7d6a58b77f0eadb22b1dc6cd5/index.pt-pt.md
themes/blowfish/exampleSite/content/users/83-706590b7d6a58b77f0eadb22b1dc6cd5/feature.webp
themes/blowfish/exampleSite/content/users/83-706590b7d6a58b77f0eadb22b1dc6cd5/index.zh-cn.md
themes/blowfish/exampleSite/content/users/98-a8ae3ddde64e0cd053837877522e2373/index.pt-br.md
themes/blowfish/exampleSite/content/users/98-a8ae3ddde64e0cd053837877522e2373/index.md
themes/blowfish/exampleSite/content/users/98-a8ae3ddde64e0cd053837877522e2373/index.de.md
themes/blowfish/exampleSite/content/users/98-a8ae3ddde64e0cd053837877522e2373/index.es.md
themes/blowfish/exampleSite/content/users/98-a8ae3ddde64e0cd053837877522e2373/index.ja.md
themes/blowfish/exampleSite/content/users/98-a8ae3ddde64e0cd053837877522e2373/index.it.md
themes/blowfish/exampleSite/content/users/98-a8ae3ddde64e0cd053837877522e2373/index.fr.md
themes/blowfish/exampleSite/content/users/12-ee5d5eca13c3742f7a454a52424f9d73/index.pt-br.md
themes/blowfish/exampleSite/content/users/98-a8ae3ddde64e0cd053837877522e2373/index.pt-pt.md
themes/blowfish/exampleSite/content/users/98-a8ae3ddde64e0cd053837877522e2373/feature.webp
themes/blowfish/exampleSite/content/users/12-ee5d5eca13c3742f7a454a52424f9d73/index.md
themes/blowfish/exampleSite/content/users/98-a8ae3ddde64e0cd053837877522e2373/index.zh-cn.md
themes/blowfish/exampleSite/content/users/12-ee5d5eca13c3742f7a454a52424f9d73/index.de.md
themes/blowfish/exampleSite/content/users/12-ee5d5eca13c3742f7a454a52424f9d73/index.es.md
themes/blowfish/exampleSite/content/users/71-54b73306674ec7e6778b54a0a8b18b36/index.pt-br.md
themes/blowfish/exampleSite/content/users/12-ee5d5eca13c3742f7a454a52424f9d73/index.ja.md
themes/blowfish/exampleSite/content/users/71-54b73306674ec7e6778b54a0a8b18b36/index.md
themes/blowfish/exampleSite/content/users/12-ee5d5eca13c3742f7a454a52424f9d73/index.it.md
themes/blowfish/exampleSite/content/users/15-039ca94b0aeeb9ab4c95226615bfb840/index.pt-br.md
themes/blowfish/exampleSite/content/users/71-54b73306674ec7e6778b54a0a8b18b36/index.de.md
themes/blowfish/exampleSite/content/users/12-ee5d5eca13c3742f7a454a52424f9d73/index.fr.md
themes/blowfish/exampleSite/content/users/15-039ca94b0aeeb9ab4c95226615bfb840/index.md
themes/blowfish/exampleSite/content/users/71-54b73306674ec7e6778b54a0a8b18b36/index.es.md
themes/blowfish/exampleSite/content/users/12-ee5d5eca13c3742f7a454a52424f9d73/index.pt-pt.md
themes/blowfish/exampleSite/content/users/15-039ca94b0aeeb9ab4c95226615bfb840/index.de.md
themes/blowfish/exampleSite/content/users/71-54b73306674ec7e6778b54a0a8b18b36/index.ja.md
themes/blowfish/exampleSite/content/users/71-54b73306674ec7e6778b54a0a8b18b36/index.it.md
themes/blowfish/exampleSite/content/users/12-ee5d5eca13c3742f7a454a52424f9d73/feature.webp
themes/blowfish/exampleSite/content/users/71-54b73306674ec7e6778b54a0a8b18b36/index.fr.md
themes/blowfish/exampleSite/content/users/71-54b73306674ec7e6778b54a0a8b18b36/index.pt-pt.md
themes/blowfish/exampleSite/content/users/12-ee5d5eca13c3742f7a454a52424f9d73/index.zh-cn.md
themes/blowfish/exampleSite/content/users/15-039ca94b0aeeb9ab4c95226615bfb840/index.es.md
themes/blowfish/exampleSite/content/users/71-54b73306674ec7e6778b54a0a8b18b36/feature.webp
themes/blowfish/exampleSite/content/users/107-e6de9b318c18b2df357ca51f0d73fff6/index.pt-br.md
themes/blowfish/exampleSite/content/users/71-54b73306674ec7e6778b54a0a8b18b36/index.zh-cn.md
themes/blowfish/exampleSite/content/users/107-e6de9b318c18b2df357ca51f0d73fff6/index.md
themes/blowfish/exampleSite/content/users/15-039ca94b0aeeb9ab4c95226615bfb840/index.ja.md
themes/blowfish/exampleSite/content/users/15-039ca94b0aeeb9ab4c95226615bfb840/index.it.md
themes/blowfish/exampleSite/content/users/107-e6de9b318c18b2df357ca51f0d73fff6/index.de.md
themes/blowfish/exampleSite/content/users/15-039ca94b0aeeb9ab4c95226615bfb840/index.fr.md
themes/blowfish/exampleSite/content/users/107-e6de9b318c18b2df357ca51f0d73fff6/index.es.md
themes/blowfish/exampleSite/content/users/15-039ca94b0aeeb9ab4c95226615bfb840/index.pt-pt.md
themes/blowfish/exampleSite/content/users/107-e6de9b318c18b2df357ca51f0d73fff6/index.ja.md
themes/blowfish/exampleSite/content/users/15-039ca94b0aeeb9ab4c95226615bfb840/feature.webp
themes/blowfish/exampleSite/content/users/107-e6de9b318c18b2df357ca51f0d73fff6/index.it.md
themes/blowfish/exampleSite/content/users/15-039ca94b0aeeb9ab4c95226615bfb840/index.zh-cn.md
themes/blowfish/exampleSite/content/users/107-e6de9b318c18b2df357ca51f0d73fff6/index.fr.md
themes/blowfish/exampleSite/content/users/107-e6de9b318c18b2df357ca51f0d73fff6/index.pt-pt.md
themes/blowfish/exampleSite/content/users/107-e6de9b318c18b2df357ca51f0d73fff6/feature.webp
themes/blowfish/exampleSite/content/users/107-e6de9b318c18b2df357ca51f0d73fff6/index.zh-cn.md
themes/blowfish/exampleSite/content/users/56-7d028665dc1cf54485e6e82a7083ce69/index.pt-br.md
themes/blowfish/exampleSite/content/users/56-7d028665dc1cf54485e6e82a7083ce69/index.md
themes/blowfish/exampleSite/content/users/56-7d028665dc1cf54485e6e82a7083ce69/index.de.md
themes/blowfish/exampleSite/content/users/56-7d028665dc1cf54485e6e82a7083ce69/index.es.md
themes/blowfish/exampleSite/content/users/56-7d028665dc1cf54485e6e82a7083ce69/index.ja.md
themes/blowfish/exampleSite/content/users/56-7d028665dc1cf54485e6e82a7083ce69/index.it.md
themes/blowfish/exampleSite/content/users/56-7d028665dc1cf54485e6e82a7083ce69/index.fr.md
themes/blowfish/exampleSite/content/users/56-7d028665dc1cf54485e6e82a7083ce69/index.pt-pt.md
themes/blowfish/exampleSite/content/users/56-7d028665dc1cf54485e6e82a7083ce69/feature.webp
themes/blowfish/exampleSite/content/users/56-7d028665dc1cf54485e6e82a7083ce69/index.zh-cn.md
themes/blowfish/exampleSite/content/users/62-4b8c5f7ee72baf8411dae867f9206b63/index.pt-br.md
themes/blowfish/exampleSite/content/users/62-4b8c5f7ee72baf8411dae867f9206b63/index.md
themes/blowfish/exampleSite/content/users/62-4b8c5f7ee72baf8411dae867f9206b63/index.de.md
themes/blowfish/exampleSite/content/users/62-4b8c5f7ee72baf8411dae867f9206b63/index.es.md
themes/blowfish/exampleSite/content/users/62-4b8c5f7ee72baf8411dae867f9206b63/index.ja.md
themes/blowfish/exampleSite/content/users/62-4b8c5f7ee72baf8411dae867f9206b63/index.it.md
themes/blowfish/exampleSite/content/users/62-4b8c5f7ee72baf8411dae867f9206b63/index.fr.md
themes/blowfish/exampleSite/content/users/62-4b8c5f7ee72baf8411dae867f9206b63/index.pt-pt.md
themes/blowfish/exampleSite/content/users/62-4b8c5f7ee72baf8411dae867f9206b63/feature.webp
themes/blowfish/exampleSite/content/users/62-4b8c5f7ee72baf8411dae867f9206b63/index.zh-cn.md
themes/blowfish/exampleSite/content/users/74-837b47128639b5359ade845eae461c3a/index.pt-br.md
themes/blowfish/exampleSite/content/users/74-837b47128639b5359ade845eae461c3a/index.md
themes/blowfish/exampleSite/content/users/74-837b47128639b5359ade845eae461c3a/index.de.md
themes/blowfish/exampleSite/content/users/74-837b47128639b5359ade845eae461c3a/index.es.md
themes/blowfish/exampleSite/content/users/74-837b47128639b5359ade845eae461c3a/index.ja.md
themes/blowfish/exampleSite/content/users/74-837b47128639b5359ade845eae461c3a/index.it.md
themes/blowfish/exampleSite/content/users/74-837b47128639b5359ade845eae461c3a/index.fr.md
themes/blowfish/exampleSite/content/users/74-837b47128639b5359ade845eae461c3a/index.pt-pt.md
themes/blowfish/exampleSite/content/users/74-837b47128639b5359ade845eae461c3a/feature.webp
themes/blowfish/exampleSite/content/users/74-837b47128639b5359ade845eae461c3a/index.zh-cn.md
themes/blowfish/assets/lib/katex/fonts/KaTeX_Math-Italic.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Script-Regular.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size4-Regular.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Fraktur-Bold.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size3-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_AMS-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_SansSerif-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Script-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-BoldItalic.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-BoldItalic.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size2-Regular.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Fraktur-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_SansSerif-Regular.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size3-Regular.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_SansSerif-Italic.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Math-Italic.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Caligraphic-Regular.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Math-Italic.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_AMS-Regular.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Caligraphic-Regular.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Math-BoldItalic.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_SansSerif-Bold.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Caligraphic-Bold.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_SansSerif-Italic.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-Italic.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Fraktur-Bold.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size4-Regular.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Fraktur-Regular.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_Size1-Regular.woff2
themes/blowfish/assets/lib/katex/fonts/KaTeX_Main-Bold.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Math-BoldItalic.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_AMS-Regular.woff
themes/blowfish/assets/lib/katex/fonts/KaTeX_SansSerif-Regular.ttf
themes/blowfish/assets/lib/katex/fonts/KaTeX_Caligraphic-Bold.woff2
themes/blowfish/exampleSite/content/users/25-8168c3eeb157c9c9b1ca287393393f9c/index.pt-br.md
themes/blowfish/assets/lib/katex/fonts/KaTeX_Typewriter-Regular.woff
themes/blowfish/exampleSite/content/users/25-8168c3eeb157c9c9b1ca287393393f9c/index.md
themes/blowfish/exampleSite/content/users/25-8168c3eeb157c9c9b1ca287393393f9c/index.de.md
themes/blowfish/exampleSite/content/users/25-8168c3eeb157c9c9b1ca287393393f9c/index.es.md
themes/blowfish/exampleSite/content/users/25-8168c3eeb157c9c9b1ca287393393f9c/index.ja.md
themes/blowfish/exampleSite/content/users/25-8168c3eeb157c9c9b1ca287393393f9c/index.it.md
themes/blowfish/exampleSite/content/users/25-8168c3eeb157c9c9b1ca287393393f9c/index.fr.md
themes/blowfish/exampleSite/content/users/25-8168c3eeb157c9c9b1ca287393393f9c/index.pt-pt.md
themes/blowfish/exampleSite/content/users/25-8168c3eeb157c9c9b1ca287393393f9c/feature.webp
themes/blowfish/exampleSite/content/users/25-8168c3eeb157c9c9b1ca287393393f9c/index.zh-cn.md
themes/blowfish/exampleSite/content/samples/thumbnail_sample/index.pt-br.md
themes/blowfish/exampleSite/content/samples/thumbnail_sample/index.md
themes/blowfish/exampleSite/content/samples/thumbnail_sample/index.de.md
themes/blowfish/exampleSite/content/samples/thumbnail_sample/index.es.md
themes/blowfish/exampleSite/content/samples/thumbnail_sample/index.ja.md
themes/blowfish/exampleSite/content/samples/thumbnail_sample/index.it.md
themes/blowfish/exampleSite/content/samples/thumbnail_sample/index.fr.md
themes/blowfish/exampleSite/content/samples/thumbnail_sample/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/thumbnail_sample/index.zh-cn.md
themes/blowfish/exampleSite/content/users/104-d168a95bef76f9306c5f0d645168f8e6/index.pt-br.md
themes/blowfish/exampleSite/content/users/104-d168a95bef76f9306c5f0d645168f8e6/index.md
themes/blowfish/exampleSite/content/users/104-d168a95bef76f9306c5f0d645168f8e6/index.de.md
themes/blowfish/exampleSite/content/users/104-d168a95bef76f9306c5f0d645168f8e6/index.es.md
themes/blowfish/exampleSite/content/users/104-d168a95bef76f9306c5f0d645168f8e6/index.ja.md
themes/blowfish/exampleSite/content/users/104-d168a95bef76f9306c5f0d645168f8e6/index.it.md
themes/blowfish/exampleSite/content/users/104-d168a95bef76f9306c5f0d645168f8e6/index.fr.md
themes/blowfish/exampleSite/content/users/104-d168a95bef76f9306c5f0d645168f8e6/index.pt-pt.md
themes/blowfish/exampleSite/content/users/104-d168a95bef76f9306c5f0d645168f8e6/feature.webp
themes/blowfish/exampleSite/content/users/104-d168a95bef76f9306c5f0d645168f8e6/index.zh-cn.md
themes/blowfish/exampleSite/content/users/11-4ea7eb30d575afb5183b02f31a661c42/index.pt-br.md
themes/blowfish/exampleSite/content/users/11-4ea7eb30d575afb5183b02f31a661c42/index.md
themes/blowfish/exampleSite/content/users/11-4ea7eb30d575afb5183b02f31a661c42/index.de.md
themes/blowfish/exampleSite/content/users/11-4ea7eb30d575afb5183b02f31a661c42/index.es.md
themes/blowfish/exampleSite/content/users/11-4ea7eb30d575afb5183b02f31a661c42/index.ja.md
themes/blowfish/exampleSite/content/users/11-4ea7eb30d575afb5183b02f31a661c42/index.it.md
themes/blowfish/exampleSite/content/users/11-4ea7eb30d575afb5183b02f31a661c42/index.fr.md
themes/blowfish/exampleSite/content/users/11-4ea7eb30d575afb5183b02f31a661c42/index.pt-pt.md
themes/blowfish/exampleSite/content/users/59-c0d9928ff3857960ec230178bdec1b8d/index.pt-br.md
themes/blowfish/exampleSite/content/users/59-c0d9928ff3857960ec230178bdec1b8d/index.md
themes/blowfish/exampleSite/content/users/59-c0d9928ff3857960ec230178bdec1b8d/index.de.md
themes/blowfish/exampleSite/content/users/59-c0d9928ff3857960ec230178bdec1b8d/index.es.md
themes/blowfish/exampleSite/content/users/59-c0d9928ff3857960ec230178bdec1b8d/index.ja.md
themes/blowfish/exampleSite/content/users/59-c0d9928ff3857960ec230178bdec1b8d/index.it.md
themes/blowfish/exampleSite/content/users/59-c0d9928ff3857960ec230178bdec1b8d/index.fr.md
themes/blowfish/exampleSite/content/users/59-c0d9928ff3857960ec230178bdec1b8d/index.pt-pt.md
themes/blowfish/exampleSite/content/users/59-c0d9928ff3857960ec230178bdec1b8d/feature.webp
themes/blowfish/exampleSite/content/users/59-c0d9928ff3857960ec230178bdec1b8d/index.zh-cn.md
themes/blowfish/exampleSite/content/users/110-860d9db7030d829b0f0128400c2ab5d4/index.pt-br.md
themes/blowfish/exampleSite/content/users/32-6e0c28f8b70015dd35f332d927960d06/index.pt-pt.md
themes/blowfish/exampleSite/content/users/110-860d9db7030d829b0f0128400c2ab5d4/index.md
themes/blowfish/exampleSite/content/users/32-6e0c28f8b70015dd35f332d927960d06/feature.webp
themes/blowfish/exampleSite/content/users/11-4ea7eb30d575afb5183b02f31a661c42/feature.webp
themes/blowfish/exampleSite/content/users/32-6e0c28f8b70015dd35f332d927960d06/index.zh-cn.md
themes/blowfish/exampleSite/content/users/11-4ea7eb30d575afb5183b02f31a661c42/index.zh-cn.md
themes/blowfish/exampleSite/content/users/110-860d9db7030d829b0f0128400c2ab5d4/index.de.md
themes/blowfish/exampleSite/content/users/110-860d9db7030d829b0f0128400c2ab5d4/index.es.md
themes/blowfish/exampleSite/content/users/110-860d9db7030d829b0f0128400c2ab5d4/index.ja.md
themes/blowfish/exampleSite/content/users/110-860d9db7030d829b0f0128400c2ab5d4/index.it.md
themes/blowfish/exampleSite/content/users/110-860d9db7030d829b0f0128400c2ab5d4/index.fr.md
themes/blowfish/exampleSite/content/users/110-860d9db7030d829b0f0128400c2ab5d4/index.pt-pt.md
themes/blowfish/exampleSite/content/users/110-860d9db7030d829b0f0128400c2ab5d4/feature.webp
themes/blowfish/exampleSite/content/users/110-860d9db7030d829b0f0128400c2ab5d4/index.zh-cn.md
themes/blowfish/exampleSite/content/users/_index.es.md
themes/blowfish/exampleSite/content/users/105-e7ef7b552aa65b10f3e26de21d81f702/feature.webp
themes/blowfish/exampleSite/content/users/105-e7ef7b552aa65b10f3e26de21d81f702/index.zh-cn.md
themes/blowfish/exampleSite/content/users/105-e7ef7b552aa65b10f3e26de21d81f702/index.pt-pt.md
themes/blowfish/exampleSite/content/users/105-e7ef7b552aa65b10f3e26de21d81f702/index.fr.md
themes/blowfish/exampleSite/content/users/93-8cb20b5823049623e2b7214c967a2efc/index.pt-br.md
themes/blowfish/exampleSite/content/users/93-8cb20b5823049623e2b7214c967a2efc/index.md
themes/blowfish/exampleSite/content/users/93-8cb20b5823049623e2b7214c967a2efc/index.de.md
themes/blowfish/exampleSite/content/users/93-8cb20b5823049623e2b7214c967a2efc/index.es.md
themes/blowfish/exampleSite/content/users/93-8cb20b5823049623e2b7214c967a2efc/index.ja.md
themes/blowfish/exampleSite/content/users/32-6e0c28f8b70015dd35f332d927960d06/index.pt-br.md
themes/blowfish/exampleSite/content/users/93-8cb20b5823049623e2b7214c967a2efc/index.it.md
themes/blowfish/exampleSite/content/users/32-6e0c28f8b70015dd35f332d927960d06/index.md
themes/blowfish/exampleSite/content/users/93-8cb20b5823049623e2b7214c967a2efc/index.fr.md
themes/blowfish/exampleSite/content/users/94-b94f03ec7b2e6d8dbac26fa6cd1cd5d4/index.pt-br.md
themes/blowfish/exampleSite/content/users/32-6e0c28f8b70015dd35f332d927960d06/index.de.md
themes/blowfish/exampleSite/content/users/93-8cb20b5823049623e2b7214c967a2efc/index.pt-pt.md
themes/blowfish/exampleSite/content/users/94-b94f03ec7b2e6d8dbac26fa6cd1cd5d4/index.md
themes/blowfish/exampleSite/content/users/93-8cb20b5823049623e2b7214c967a2efc/feature.webp
themes/blowfish/exampleSite/content/users/32-6e0c28f8b70015dd35f332d927960d06/index.es.md
themes/blowfish/exampleSite/content/users/93-8cb20b5823049623e2b7214c967a2efc/index.zh-cn.md
themes/blowfish/exampleSite/content/users/94-b94f03ec7b2e6d8dbac26fa6cd1cd5d4/index.de.md
themes/blowfish/exampleSite/content/users/32-6e0c28f8b70015dd35f332d927960d06/index.ja.md
themes/blowfish/exampleSite/content/users/94-b94f03ec7b2e6d8dbac26fa6cd1cd5d4/index.es.md
themes/blowfish/exampleSite/content/users/32-6e0c28f8b70015dd35f332d927960d06/index.it.md
themes/blowfish/exampleSite/content/users/32-6e0c28f8b70015dd35f332d927960d06/index.fr.md
themes/blowfish/exampleSite/content/users/94-b94f03ec7b2e6d8dbac26fa6cd1cd5d4/index.ja.md
themes/blowfish/exampleSite/content/users/94-b94f03ec7b2e6d8dbac26fa6cd1cd5d4/index.it.md
themes/blowfish/exampleSite/content/users/94-b94f03ec7b2e6d8dbac26fa6cd1cd5d4/index.fr.md
themes/blowfish/exampleSite/content/users/94-b94f03ec7b2e6d8dbac26fa6cd1cd5d4/index.pt-pt.md
themes/blowfish/exampleSite/content/users/94-b94f03ec7b2e6d8dbac26fa6cd1cd5d4/feature.webp
themes/blowfish/exampleSite/content/users/94-b94f03ec7b2e6d8dbac26fa6cd1cd5d4/index.zh-cn.md
themes/blowfish/exampleSite/content/users/105-e7ef7b552aa65b10f3e26de21d81f702/index.pt-br.md
themes/blowfish/exampleSite/content/users/105-e7ef7b552aa65b10f3e26de21d81f702/index.md
themes/blowfish/exampleSite/content/users/105-e7ef7b552aa65b10f3e26de21d81f702/index.de.md
themes/blowfish/exampleSite/content/users/105-e7ef7b552aa65b10f3e26de21d81f702/index.es.md
themes/blowfish/exampleSite/content/users/105-e7ef7b552aa65b10f3e26de21d81f702/index.ja.md
themes/blowfish/exampleSite/content/samples/emoji/index.pt-br.md
themes/blowfish/exampleSite/content/samples/emoji/index.md
themes/blowfish/exampleSite/content/samples/emoji/index.de.md
themes/blowfish/exampleSite/content/samples/emoji/index.es.md
themes/blowfish/exampleSite/content/samples/emoji/index.ja.md
themes/blowfish/exampleSite/content/samples/emoji/index.it.md
themes/blowfish/exampleSite/content/samples/emoji/index.fr.md
themes/blowfish/exampleSite/content/users/105-e7ef7b552aa65b10f3e26de21d81f702/index.it.md
themes/blowfish/exampleSite/content/samples/emoji/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/emoji/index.zh-cn.md
themes/blowfish/exampleSite/content/samples/_index.es.md
themes/blowfish/exampleSite/content/samples/_index.pt-pt.md
themes/blowfish/exampleSite/content/users/111-118f0958fbab30b68d5bb3359548a40f/index.pt-br.md
themes/blowfish/exampleSite/content/users/111-118f0958fbab30b68d5bb3359548a40f/index.md
themes/blowfish/exampleSite/content/users/111-118f0958fbab30b68d5bb3359548a40f/index.de.md
themes/blowfish/exampleSite/content/users/111-118f0958fbab30b68d5bb3359548a40f/index.es.md
themes/blowfish/exampleSite/content/users/111-118f0958fbab30b68d5bb3359548a40f/index.ja.md
themes/blowfish/exampleSite/content/users/111-118f0958fbab30b68d5bb3359548a40f/index.it.md
themes/blowfish/exampleSite/content/users/111-118f0958fbab30b68d5bb3359548a40f/index.fr.md
themes/blowfish/exampleSite/content/users/111-118f0958fbab30b68d5bb3359548a40f/index.pt-pt.md
themes/blowfish/exampleSite/content/users/111-118f0958fbab30b68d5bb3359548a40f/feature.webp
themes/blowfish/exampleSite/content/users/111-118f0958fbab30b68d5bb3359548a40f/index.zh-cn.md
themes/blowfish/exampleSite/content/users/91-e4f1c9a4c352ea63707824576d889c8f/index.pt-br.md
themes/blowfish/exampleSite/content/users/91-e4f1c9a4c352ea63707824576d889c8f/index.md
themes/blowfish/exampleSite/content/users/91-e4f1c9a4c352ea63707824576d889c8f/index.de.md
themes/blowfish/exampleSite/content/users/91-e4f1c9a4c352ea63707824576d889c8f/index.es.md
themes/blowfish/exampleSite/content/users/91-e4f1c9a4c352ea63707824576d889c8f/index.ja.md
themes/blowfish/exampleSite/content/users/91-e4f1c9a4c352ea63707824576d889c8f/index.it.md
themes/blowfish/exampleSite/content/users/91-e4f1c9a4c352ea63707824576d889c8f/index.fr.md
themes/blowfish/exampleSite/content/users/91-e4f1c9a4c352ea63707824576d889c8f/index.pt-pt.md
themes/blowfish/exampleSite/content/users/91-e4f1c9a4c352ea63707824576d889c8f/feature.webp
themes/blowfish/exampleSite/content/users/91-e4f1c9a4c352ea63707824576d889c8f/index.zh-cn.md
themes/blowfish/exampleSite/content/users/26-98f15180691d43fbfcbaf685e1b9ab06/index.pt-br.md
themes/blowfish/exampleSite/content/users/26-98f15180691d43fbfcbaf685e1b9ab06/index.md
themes/blowfish/exampleSite/content/users/26-98f15180691d43fbfcbaf685e1b9ab06/index.de.md
themes/blowfish/exampleSite/content/users/26-98f15180691d43fbfcbaf685e1b9ab06/index.es.md
themes/blowfish/exampleSite/content/users/26-98f15180691d43fbfcbaf685e1b9ab06/index.ja.md
themes/blowfish/exampleSite/content/users/26-98f15180691d43fbfcbaf685e1b9ab06/index.it.md
themes/blowfish/exampleSite/content/users/26-98f15180691d43fbfcbaf685e1b9ab06/index.fr.md
themes/blowfish/exampleSite/content/users/26-98f15180691d43fbfcbaf685e1b9ab06/index.pt-pt.md
themes/blowfish/exampleSite/content/users/26-98f15180691d43fbfcbaf685e1b9ab06/feature.webp
themes/blowfish/exampleSite/content/users/26-98f15180691d43fbfcbaf685e1b9ab06/index.zh-cn.md
themes/blowfish/exampleSite/content/users/_index.pt-br.md
themes/blowfish/exampleSite/content/users/75-1b3da762734b4fb503e49822ed506dbb/index.pt-br.md
themes/blowfish/exampleSite/content/users/75-1b3da762734b4fb503e49822ed506dbb/index.md
themes/blowfish/exampleSite/content/users/75-1b3da762734b4fb503e49822ed506dbb/index.de.md
themes/blowfish/exampleSite/content/users/75-1b3da762734b4fb503e49822ed506dbb/index.es.md
themes/blowfish/exampleSite/content/users/75-1b3da762734b4fb503e49822ed506dbb/index.ja.md
themes/blowfish/exampleSite/content/users/75-1b3da762734b4fb503e49822ed506dbb/index.it.md
themes/blowfish/exampleSite/content/users/75-1b3da762734b4fb503e49822ed506dbb/index.fr.md
themes/blowfish/exampleSite/content/users/75-1b3da762734b4fb503e49822ed506dbb/index.pt-pt.md
themes/blowfish/exampleSite/content/users/75-1b3da762734b4fb503e49822ed506dbb/feature.webp
themes/blowfish/exampleSite/content/users/75-1b3da762734b4fb503e49822ed506dbb/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/_index.pt-br.md
themes/blowfish/exampleSite/content/users/1-96d3e57dcc931de55cc23a825d40be2c/index.pt-br.md
themes/blowfish/exampleSite/content/users/1-96d3e57dcc931de55cc23a825d40be2c/index.md
themes/blowfish/exampleSite/content/users/1-96d3e57dcc931de55cc23a825d40be2c/index.de.md
themes/blowfish/exampleSite/content/users/1-96d3e57dcc931de55cc23a825d40be2c/index.es.md
themes/blowfish/exampleSite/content/users/1-96d3e57dcc931de55cc23a825d40be2c/index.ja.md
themes/blowfish/exampleSite/content/users/1-96d3e57dcc931de55cc23a825d40be2c/index.it.md
themes/blowfish/exampleSite/content/users/1-96d3e57dcc931de55cc23a825d40be2c/index.fr.md
themes/blowfish/exampleSite/content/users/1-96d3e57dcc931de55cc23a825d40be2c/index.pt-pt.md
themes/blowfish/exampleSite/content/users/76-447e2f0f6f439b915e0b57f93e49b7d6/index.pt-br.md
themes/blowfish/exampleSite/content/users/76-447e2f0f6f439b915e0b57f93e49b7d6/index.md
themes/blowfish/exampleSite/content/users/76-447e2f0f6f439b915e0b57f93e49b7d6/index.de.md
themes/blowfish/exampleSite/content/users/76-447e2f0f6f439b915e0b57f93e49b7d6/index.es.md
themes/blowfish/exampleSite/content/users/76-447e2f0f6f439b915e0b57f93e49b7d6/index.ja.md
themes/blowfish/exampleSite/content/users/76-447e2f0f6f439b915e0b57f93e49b7d6/index.it.md
themes/blowfish/exampleSite/content/users/76-447e2f0f6f439b915e0b57f93e49b7d6/index.fr.md
themes/blowfish/exampleSite/content/users/76-447e2f0f6f439b915e0b57f93e49b7d6/index.pt-pt.md
themes/blowfish/exampleSite/content/users/1-96d3e57dcc931de55cc23a825d40be2c/feature.webp
themes/blowfish/exampleSite/content/users/76-447e2f0f6f439b915e0b57f93e49b7d6/feature.webp
themes/blowfish/exampleSite/content/users/76-447e2f0f6f439b915e0b57f93e49b7d6/index.zh-cn.md
themes/blowfish/exampleSite/content/users/1-96d3e57dcc931de55cc23a825d40be2c/index.zh-cn.md
themes/blowfish/exampleSite/content/users/_index.it.md
themes/blowfish/exampleSite/content/users/70-7596a225b244e0859da338621e680481/index.pt-br.md
themes/blowfish/exampleSite/content/users/35-069e8f01e7ef48830ebea5239e2189b4/index.fr.md
themes/blowfish/exampleSite/content/users/70-7596a225b244e0859da338621e680481/index.md
themes/blowfish/exampleSite/content/users/35-069e8f01e7ef48830ebea5239e2189b4/index.pt-pt.md
themes/blowfish/exampleSite/content/users/70-7596a225b244e0859da338621e680481/index.de.md
themes/blowfish/exampleSite/content/users/35-069e8f01e7ef48830ebea5239e2189b4/feature.webp
themes/blowfish/exampleSite/content/users/70-7596a225b244e0859da338621e680481/index.es.md
themes/blowfish/exampleSite/content/users/35-069e8f01e7ef48830ebea5239e2189b4/index.zh-cn.md
themes/blowfish/exampleSite/content/users/70-7596a225b244e0859da338621e680481/index.ja.md
themes/blowfish/exampleSite/content/users/70-7596a225b244e0859da338621e680481/index.it.md
themes/blowfish/exampleSite/content/users/70-7596a225b244e0859da338621e680481/index.fr.md
themes/blowfish/exampleSite/content/users/70-7596a225b244e0859da338621e680481/index.pt-pt.md
themes/blowfish/exampleSite/content/users/70-7596a225b244e0859da338621e680481/feature.webp
themes/blowfish/exampleSite/content/users/70-7596a225b244e0859da338621e680481/index.zh-cn.md
themes/blowfish/exampleSite/content/users/101-a8326fb0e2d1670165af1c6547b239dd/index.pt-br.md
themes/blowfish/exampleSite/content/users/101-a8326fb0e2d1670165af1c6547b239dd/index.md
themes/blowfish/exampleSite/content/users/101-a8326fb0e2d1670165af1c6547b239dd/index.de.md
themes/blowfish/exampleSite/content/users/101-a8326fb0e2d1670165af1c6547b239dd/index.es.md
themes/blowfish/exampleSite/content/users/53-6e57b74d392f64f3698aee7046cc2606/index.pt-br.md
themes/blowfish/exampleSite/content/users/53-6e57b74d392f64f3698aee7046cc2606/index.md
themes/blowfish/exampleSite/content/users/53-6e57b74d392f64f3698aee7046cc2606/index.de.md
themes/blowfish/exampleSite/content/users/53-6e57b74d392f64f3698aee7046cc2606/index.es.md
themes/blowfish/exampleSite/content/users/53-6e57b74d392f64f3698aee7046cc2606/index.ja.md
themes/blowfish/exampleSite/content/users/53-6e57b74d392f64f3698aee7046cc2606/index.it.md
themes/blowfish/exampleSite/content/users/53-6e57b74d392f64f3698aee7046cc2606/index.fr.md
themes/blowfish/exampleSite/content/users/53-6e57b74d392f64f3698aee7046cc2606/index.pt-pt.md
themes/blowfish/exampleSite/content/users/53-6e57b74d392f64f3698aee7046cc2606/feature.webp
themes/blowfish/exampleSite/content/users/53-6e57b74d392f64f3698aee7046cc2606/index.zh-cn.md
themes/blowfish/exampleSite/content/users/101-a8326fb0e2d1670165af1c6547b239dd/index.ja.md
themes/blowfish/exampleSite/content/users/101-a8326fb0e2d1670165af1c6547b239dd/index.it.md
themes/blowfish/exampleSite/content/users/101-a8326fb0e2d1670165af1c6547b239dd/index.fr.md
themes/blowfish/exampleSite/content/users/101-a8326fb0e2d1670165af1c6547b239dd/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/external/index.pt-br.md
themes/blowfish/exampleSite/content/users/101-a8326fb0e2d1670165af1c6547b239dd/feature.webp
themes/blowfish/exampleSite/content/users/35-069e8f01e7ef48830ebea5239e2189b4/index.pt-br.md
themes/blowfish/exampleSite/content/users/101-a8326fb0e2d1670165af1c6547b239dd/index.zh-cn.md
themes/blowfish/exampleSite/content/samples/external/index.md
themes/blowfish/exampleSite/content/users/35-069e8f01e7ef48830ebea5239e2189b4/index.md
themes/blowfish/exampleSite/content/samples/external/index.de.md
themes/blowfish/exampleSite/content/users/35-069e8f01e7ef48830ebea5239e2189b4/index.de.md
themes/blowfish/exampleSite/content/samples/external/index.es.md
themes/blowfish/exampleSite/content/users/35-069e8f01e7ef48830ebea5239e2189b4/index.es.md
themes/blowfish/exampleSite/content/samples/external/index.ja.md
themes/blowfish/exampleSite/content/users/35-069e8f01e7ef48830ebea5239e2189b4/index.ja.md
themes/blowfish/exampleSite/content/samples/external/index.it.md
themes/blowfish/exampleSite/content/users/35-069e8f01e7ef48830ebea5239e2189b4/index.it.md
themes/blowfish/exampleSite/content/samples/external/index.fr.md
themes/blowfish/exampleSite/content/samples/external/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/external/index.zh-cn.md
themes/blowfish/exampleSite/content/users/86-e3f304eacd2f79e31f294cae0ff8162e/index.pt-br.md
themes/blowfish/exampleSite/content/users/86-e3f304eacd2f79e31f294cae0ff8162e/index.md
themes/blowfish/exampleSite/content/users/86-e3f304eacd2f79e31f294cae0ff8162e/index.de.md
themes/blowfish/exampleSite/content/users/86-e3f304eacd2f79e31f294cae0ff8162e/index.es.md
themes/blowfish/exampleSite/content/users/86-e3f304eacd2f79e31f294cae0ff8162e/index.ja.md
themes/blowfish/exampleSite/content/users/10-7ee8520d5e9eadae8557be82f46ff18d/index.pt-br.md
themes/blowfish/exampleSite/content/users/86-e3f304eacd2f79e31f294cae0ff8162e/index.it.md
themes/blowfish/exampleSite/content/users/86-e3f304eacd2f79e31f294cae0ff8162e/index.fr.md
themes/blowfish/exampleSite/content/users/10-7ee8520d5e9eadae8557be82f46ff18d/index.md
themes/blowfish/exampleSite/content/users/86-e3f304eacd2f79e31f294cae0ff8162e/index.pt-pt.md
themes/blowfish/exampleSite/content/users/10-7ee8520d5e9eadae8557be82f46ff18d/index.de.md
themes/blowfish/exampleSite/content/users/86-e3f304eacd2f79e31f294cae0ff8162e/feature.webp
themes/blowfish/exampleSite/content/users/10-7ee8520d5e9eadae8557be82f46ff18d/index.es.md
themes/blowfish/exampleSite/content/users/86-e3f304eacd2f79e31f294cae0ff8162e/index.zh-cn.md
themes/blowfish/exampleSite/content/users/10-7ee8520d5e9eadae8557be82f46ff18d/index.ja.md
themes/blowfish/exampleSite/content/users/10-7ee8520d5e9eadae8557be82f46ff18d/index.it.md
themes/blowfish/exampleSite/content/users/10-7ee8520d5e9eadae8557be82f46ff18d/index.fr.md
themes/blowfish/exampleSite/content/users/10-7ee8520d5e9eadae8557be82f46ff18d/index.pt-pt.md
themes/blowfish/exampleSite/content/users/10-7ee8520d5e9eadae8557be82f46ff18d/feature.webp
themes/blowfish/exampleSite/content/users/10-7ee8520d5e9eadae8557be82f46ff18d/index.zh-cn.md
themes/blowfish/exampleSite/content/users/102-e2d4a1e205128436961ad3e1f2d0de5e/index.pt-br.md
themes/blowfish/exampleSite/content/users/102-e2d4a1e205128436961ad3e1f2d0de5e/index.md
themes/blowfish/exampleSite/content/users/102-e2d4a1e205128436961ad3e1f2d0de5e/index.de.md
themes/blowfish/exampleSite/content/users/102-e2d4a1e205128436961ad3e1f2d0de5e/index.es.md
themes/blowfish/exampleSite/content/users/102-e2d4a1e205128436961ad3e1f2d0de5e/index.ja.md
themes/blowfish/exampleSite/content/users/102-e2d4a1e205128436961ad3e1f2d0de5e/index.it.md
themes/blowfish/exampleSite/content/users/102-e2d4a1e205128436961ad3e1f2d0de5e/index.fr.md
themes/blowfish/exampleSite/content/users/102-e2d4a1e205128436961ad3e1f2d0de5e/index.pt-pt.md
themes/blowfish/exampleSite/content/users/102-e2d4a1e205128436961ad3e1f2d0de5e/feature.webp
themes/blowfish/exampleSite/content/users/102-e2d4a1e205128436961ad3e1f2d0de5e/index.zh-cn.md
themes/blowfish/exampleSite/content/users/34-c8eb3ba4d0e565e041ead9aabe6fc770/index.pt-br.md
themes/blowfish/exampleSite/content/users/34-c8eb3ba4d0e565e041ead9aabe6fc770/index.md
themes/blowfish/exampleSite/content/users/34-c8eb3ba4d0e565e041ead9aabe6fc770/index.de.md
themes/blowfish/exampleSite/content/users/34-c8eb3ba4d0e565e041ead9aabe6fc770/index.es.md
themes/blowfish/exampleSite/content/users/34-c8eb3ba4d0e565e041ead9aabe6fc770/index.ja.md
themes/blowfish/exampleSite/content/users/34-c8eb3ba4d0e565e041ead9aabe6fc770/index.it.md
themes/blowfish/exampleSite/content/users/34-c8eb3ba4d0e565e041ead9aabe6fc770/index.fr.md
themes/blowfish/exampleSite/content/users/34-c8eb3ba4d0e565e041ead9aabe6fc770/index.pt-pt.md
themes/blowfish/exampleSite/content/users/34-c8eb3ba4d0e565e041ead9aabe6fc770/feature.webp
themes/blowfish/exampleSite/content/users/34-c8eb3ba4d0e565e041ead9aabe6fc770/index.zh-cn.md
themes/blowfish/exampleSite/content/users/49-6a603c5d465ecb2422ed7a96fd55c99c/index.zh-cn.md
themes/blowfish/exampleSite/content/users/49-6a603c5d465ecb2422ed7a96fd55c99c/feature.webp
themes/blowfish/exampleSite/content/users/18-e07582d573aa187c3c15bb042872ca4a/index.pt-br.md
themes/blowfish/exampleSite/content/users/18-e07582d573aa187c3c15bb042872ca4a/index.md
themes/blowfish/exampleSite/content/users/18-e07582d573aa187c3c15bb042872ca4a/index.de.md
themes/blowfish/exampleSite/content/users/18-e07582d573aa187c3c15bb042872ca4a/index.es.md
themes/blowfish/exampleSite/content/users/18-e07582d573aa187c3c15bb042872ca4a/index.ja.md
themes/blowfish/exampleSite/content/users/18-e07582d573aa187c3c15bb042872ca4a/index.it.md
themes/blowfish/exampleSite/content/users/18-e07582d573aa187c3c15bb042872ca4a/index.fr.md
themes/blowfish/exampleSite/content/users/18-e07582d573aa187c3c15bb042872ca4a/index.pt-pt.md
themes/blowfish/exampleSite/content/users/18-e07582d573aa187c3c15bb042872ca4a/feature.webp
themes/blowfish/exampleSite/content/users/18-e07582d573aa187c3c15bb042872ca4a/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/firebase-views/featured.svg
themes/blowfish/exampleSite/content/docs/firebase-views/index.pt-br.md
themes/blowfish/exampleSite/content/users/6-ef51c7b9654a4f2d13525eb80ee46cdf/index.pt-br.md
themes/blowfish/exampleSite/content/users/23-129162dc71b9d40ee7948e51910d415a/index.pt-br.md
themes/blowfish/exampleSite/content/users/6-ef51c7b9654a4f2d13525eb80ee46cdf/index.md
themes/blowfish/exampleSite/content/docs/firebase-views/index.md
themes/blowfish/exampleSite/content/users/23-129162dc71b9d40ee7948e51910d415a/index.md
themes/blowfish/exampleSite/content/docs/firebase-views/index.de.md
themes/blowfish/exampleSite/content/users/6-ef51c7b9654a4f2d13525eb80ee46cdf/index.de.md
themes/blowfish/exampleSite/content/users/23-129162dc71b9d40ee7948e51910d415a/index.de.md
themes/blowfish/exampleSite/content/docs/firebase-views/background.svg
themes/blowfish/exampleSite/content/users/30-d8ebb1396d8c7d2233b33a6b3ca0adc4/index.pt-br.md
themes/blowfish/exampleSite/content/users/6-ef51c7b9654a4f2d13525eb80ee46cdf/index.es.md
themes/blowfish/exampleSite/content/docs/firebase-views/index.es.md
themes/blowfish/exampleSite/content/docs/firebase-views/index.ja.md
themes/blowfish/exampleSite/content/users/6-ef51c7b9654a4f2d13525eb80ee46cdf/index.ja.md
themes/blowfish/exampleSite/content/users/6-ef51c7b9654a4f2d13525eb80ee46cdf/index.it.md
themes/blowfish/exampleSite/content/users/30-d8ebb1396d8c7d2233b33a6b3ca0adc4/index.md
themes/blowfish/exampleSite/content/docs/firebase-views/index.it.md
themes/blowfish/exampleSite/content/users/6-ef51c7b9654a4f2d13525eb80ee46cdf/index.fr.md
themes/blowfish/exampleSite/content/users/30-d8ebb1396d8c7d2233b33a6b3ca0adc4/index.de.md
themes/blowfish/exampleSite/content/docs/firebase-views/index.fr.md
themes/blowfish/exampleSite/content/users/6-ef51c7b9654a4f2d13525eb80ee46cdf/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/firebase-views/index.pt-pt.md
themes/blowfish/exampleSite/content/users/6-ef51c7b9654a4f2d13525eb80ee46cdf/feature.webp
themes/blowfish/exampleSite/content/users/30-d8ebb1396d8c7d2233b33a6b3ca0adc4/index.es.md
themes/blowfish/exampleSite/content/users/6-ef51c7b9654a4f2d13525eb80ee46cdf/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/firebase-views/index.zh-cn.md
themes/blowfish/exampleSite/content/users/30-d8ebb1396d8c7d2233b33a6b3ca0adc4/index.ja.md
themes/blowfish/exampleSite/content/users/30-d8ebb1396d8c7d2233b33a6b3ca0adc4/index.it.md
themes/blowfish/exampleSite/content/users/30-d8ebb1396d8c7d2233b33a6b3ca0adc4/index.fr.md
themes/blowfish/exampleSite/content/users/30-d8ebb1396d8c7d2233b33a6b3ca0adc4/index.pt-pt.md
themes/blowfish/exampleSite/content/users/30-d8ebb1396d8c7d2233b33a6b3ca0adc4/feature.webp
themes/blowfish/exampleSite/content/users/30-d8ebb1396d8c7d2233b33a6b3ca0adc4/index.zh-cn.md
themes/blowfish/exampleSite/content/users/52-0327ac1993f378aa2fc5bbb8a840c9cb/index.fr.md
themes/blowfish/exampleSite/content/users/52-0327ac1993f378aa2fc5bbb8a840c9cb/index.pt-pt.md
themes/blowfish/exampleSite/content/users/23-129162dc71b9d40ee7948e51910d415a/index.es.md
themes/blowfish/exampleSite/content/users/52-0327ac1993f378aa2fc5bbb8a840c9cb/feature.webp
themes/blowfish/exampleSite/content/users/23-129162dc71b9d40ee7948e51910d415a/index.ja.md
themes/blowfish/exampleSite/content/users/52-0327ac1993f378aa2fc5bbb8a840c9cb/index.zh-cn.md
themes/blowfish/exampleSite/content/users/23-129162dc71b9d40ee7948e51910d415a/index.it.md
themes/blowfish/exampleSite/content/users/23-129162dc71b9d40ee7948e51910d415a/index.fr.md
themes/blowfish/exampleSite/content/users/52-0327ac1993f378aa2fc5bbb8a840c9cb/index.ja.md
themes/blowfish/exampleSite/content/users/23-129162dc71b9d40ee7948e51910d415a/index.pt-pt.md
themes/blowfish/exampleSite/content/users/23-129162dc71b9d40ee7948e51910d415a/feature.webp
themes/blowfish/exampleSite/content/users/23-129162dc71b9d40ee7948e51910d415a/index.zh-cn.md
themes/blowfish/exampleSite/content/users/52-0327ac1993f378aa2fc5bbb8a840c9cb/index.it.md
themes/blowfish/exampleSite/content/users/52-0327ac1993f378aa2fc5bbb8a840c9cb/index.es.md
themes/blowfish/exampleSite/content/users/52-0327ac1993f378aa2fc5bbb8a840c9cb/index.de.md
themes/blowfish/exampleSite/content/samples/multiple-authors/index.pt-br.md
themes/blowfish/exampleSite/content/samples/multiple-authors/index.md
themes/blowfish/exampleSite/content/samples/multiple-authors/index.de.md
themes/blowfish/exampleSite/content/samples/multiple-authors/index.es.md
themes/blowfish/exampleSite/content/samples/multiple-authors/index.ja.md
themes/blowfish/exampleSite/content/samples/multiple-authors/index.it.md
themes/blowfish/exampleSite/content/samples/multiple-authors/index.fr.md
themes/blowfish/exampleSite/content/samples/multiple-authors/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/multiple-authors/index.zh-cn.md
themes/blowfish/exampleSite/content/users/49-6a603c5d465ecb2422ed7a96fd55c99c/index.pt-br.md
themes/blowfish/exampleSite/content/users/49-6a603c5d465ecb2422ed7a96fd55c99c/index.md
themes/blowfish/exampleSite/content/users/49-6a603c5d465ecb2422ed7a96fd55c99c/index.de.md
themes/blowfish/exampleSite/content/users/49-6a603c5d465ecb2422ed7a96fd55c99c/index.es.md
themes/blowfish/exampleSite/content/users/49-6a603c5d465ecb2422ed7a96fd55c99c/index.ja.md
themes/blowfish/exampleSite/content/users/49-6a603c5d465ecb2422ed7a96fd55c99c/index.it.md
themes/blowfish/exampleSite/content/users/49-6a603c5d465ecb2422ed7a96fd55c99c/index.fr.md
themes/blowfish/exampleSite/content/users/49-6a603c5d465ecb2422ed7a96fd55c99c/index.pt-pt.md
themes/blowfish/exampleSite/content/users/52-0327ac1993f378aa2fc5bbb8a840c9cb/index.pt-br.md
themes/blowfish/exampleSite/content/users/52-0327ac1993f378aa2fc5bbb8a840c9cb/index.md
themes/blowfish/exampleSite/content/users/4-64ef36564d497eed256b9f4c56b1184e/index.pt-br.md
themes/blowfish/exampleSite/content/users/4-64ef36564d497eed256b9f4c56b1184e/index.md
themes/blowfish/exampleSite/content/users/4-64ef36564d497eed256b9f4c56b1184e/index.de.md
themes/blowfish/exampleSite/content/users/4-64ef36564d497eed256b9f4c56b1184e/index.es.md
themes/blowfish/exampleSite/content/users/82-eb23ebd26738c98db323eff207dc7c0e/index.pt-br.md
themes/blowfish/exampleSite/content/users/82-eb23ebd26738c98db323eff207dc7c0e/index.md
themes/blowfish/exampleSite/content/users/82-eb23ebd26738c98db323eff207dc7c0e/index.de.md
themes/blowfish/exampleSite/content/users/82-eb23ebd26738c98db323eff207dc7c0e/index.es.md
themes/blowfish/exampleSite/content/users/82-eb23ebd26738c98db323eff207dc7c0e/index.ja.md
themes/blowfish/exampleSite/content/users/82-eb23ebd26738c98db323eff207dc7c0e/index.it.md
themes/blowfish/exampleSite/content/users/82-eb23ebd26738c98db323eff207dc7c0e/index.fr.md
themes/blowfish/exampleSite/content/users/82-eb23ebd26738c98db323eff207dc7c0e/index.pt-pt.md
themes/blowfish/exampleSite/content/users/82-eb23ebd26738c98db323eff207dc7c0e/feature.webp
themes/blowfish/exampleSite/content/users/82-eb23ebd26738c98db323eff207dc7c0e/index.zh-cn.md
themes/blowfish/exampleSite/content/users/4-64ef36564d497eed256b9f4c56b1184e/index.ja.md
themes/blowfish/exampleSite/content/users/4-64ef36564d497eed256b9f4c56b1184e/index.it.md
themes/blowfish/exampleSite/content/users/4-64ef36564d497eed256b9f4c56b1184e/index.fr.md
themes/blowfish/exampleSite/content/users/4-64ef36564d497eed256b9f4c56b1184e/index.pt-pt.md
themes/blowfish/exampleSite/content/users/4-64ef36564d497eed256b9f4c56b1184e/feature.webp
themes/blowfish/exampleSite/content/users/4-64ef36564d497eed256b9f4c56b1184e/index.zh-cn.md
themes/blowfish/exampleSite/content/users/106-834393216bdba408631c891ee45d379c/index.pt-br.md
themes/blowfish/exampleSite/content/users/106-834393216bdba408631c891ee45d379c/index.md
themes/blowfish/exampleSite/content/users/106-834393216bdba408631c891ee45d379c/index.de.md
themes/blowfish/exampleSite/content/users/106-834393216bdba408631c891ee45d379c/index.es.md
themes/blowfish/exampleSite/content/users/106-834393216bdba408631c891ee45d379c/index.ja.md
themes/blowfish/exampleSite/content/users/106-834393216bdba408631c891ee45d379c/index.it.md
themes/blowfish/exampleSite/content/users/106-834393216bdba408631c891ee45d379c/index.fr.md
themes/blowfish/exampleSite/content/users/106-834393216bdba408631c891ee45d379c/index.pt-pt.md
themes/blowfish/exampleSite/content/users/106-834393216bdba408631c891ee45d379c/feature.webp
themes/blowfish/exampleSite/content/users/106-834393216bdba408631c891ee45d379c/index.zh-cn.md
themes/blowfish/exampleSite/content/users/97-16a262b9921c2d90b4bc072bbb3c1d56/index.pt-br.md
themes/blowfish/exampleSite/content/users/97-16a262b9921c2d90b4bc072bbb3c1d56/index.md
themes/blowfish/exampleSite/content/users/97-16a262b9921c2d90b4bc072bbb3c1d56/index.de.md
themes/blowfish/exampleSite/content/users/97-16a262b9921c2d90b4bc072bbb3c1d56/index.es.md
themes/blowfish/exampleSite/content/users/97-16a262b9921c2d90b4bc072bbb3c1d56/index.ja.md
themes/blowfish/exampleSite/content/users/97-16a262b9921c2d90b4bc072bbb3c1d56/index.it.md
themes/blowfish/exampleSite/content/users/97-16a262b9921c2d90b4bc072bbb3c1d56/index.fr.md
themes/blowfish/exampleSite/content/users/97-16a262b9921c2d90b4bc072bbb3c1d56/index.pt-pt.md
themes/blowfish/exampleSite/content/users/97-16a262b9921c2d90b4bc072bbb3c1d56/feature.webp
themes/blowfish/exampleSite/content/users/97-16a262b9921c2d90b4bc072bbb3c1d56/index.zh-cn.md
themes/blowfish/exampleSite/content/users/8-5440c85ea880d93157088032515962d3/index.pt-br.md
themes/blowfish/exampleSite/content/users/8-5440c85ea880d93157088032515962d3/index.md
themes/blowfish/exampleSite/content/users/8-5440c85ea880d93157088032515962d3/index.de.md
themes/blowfish/exampleSite/content/users/8-5440c85ea880d93157088032515962d3/index.es.md
themes/blowfish/exampleSite/content/users/8-5440c85ea880d93157088032515962d3/index.ja.md
themes/blowfish/exampleSite/content/users/8-5440c85ea880d93157088032515962d3/index.it.md
themes/blowfish/exampleSite/content/users/8-5440c85ea880d93157088032515962d3/index.fr.md
themes/blowfish/exampleSite/content/users/16-620af4c12a7ee8932fadb45ae52bba7e/index.pt-br.md
themes/blowfish/exampleSite/content/users/8-5440c85ea880d93157088032515962d3/index.pt-pt.md
themes/blowfish/exampleSite/content/users/16-620af4c12a7ee8932fadb45ae52bba7e/index.md
themes/blowfish/exampleSite/content/users/8-5440c85ea880d93157088032515962d3/feature.webp
themes/blowfish/exampleSite/content/users/8-5440c85ea880d93157088032515962d3/index.zh-cn.md
themes/blowfish/exampleSite/content/users/16-620af4c12a7ee8932fadb45ae52bba7e/index.de.md
themes/blowfish/exampleSite/content/users/16-620af4c12a7ee8932fadb45ae52bba7e/index.es.md
themes/blowfish/exampleSite/content/users/16-620af4c12a7ee8932fadb45ae52bba7e/index.ja.md
themes/blowfish/exampleSite/content/users/16-620af4c12a7ee8932fadb45ae52bba7e/index.it.md
themes/blowfish/exampleSite/content/users/16-620af4c12a7ee8932fadb45ae52bba7e/index.fr.md
themes/blowfish/exampleSite/content/users/16-620af4c12a7ee8932fadb45ae52bba7e/index.pt-pt.md
themes/blowfish/exampleSite/content/users/16-620af4c12a7ee8932fadb45ae52bba7e/feature.webp
themes/blowfish/exampleSite/content/users/16-620af4c12a7ee8932fadb45ae52bba7e/index.zh-cn.md
themes/blowfish/exampleSite/content/samples/icons/index.pt-br.md
themes/blowfish/exampleSite/content/samples/icons/index.md
themes/blowfish/exampleSite/content/samples/icons/index.de.md
themes/blowfish/exampleSite/content/samples/icons/index.es.md
themes/blowfish/exampleSite/content/samples/icons/index.ja.md
themes/blowfish/exampleSite/content/samples/icons/index.it.md
themes/blowfish/exampleSite/content/samples/icons/index.fr.md
themes/blowfish/exampleSite/content/samples/icons/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/icons/index.zh-cn.md
themes/blowfish/exampleSite/content/users/64-02c452502ee9a03866c720c14bf86f9e/index.pt-br.md
themes/blowfish/exampleSite/content/users/64-02c452502ee9a03866c720c14bf86f9e/index.md
themes/blowfish/exampleSite/content/users/64-02c452502ee9a03866c720c14bf86f9e/index.de.md
themes/blowfish/exampleSite/content/users/64-02c452502ee9a03866c720c14bf86f9e/index.es.md
themes/blowfish/exampleSite/content/users/64-02c452502ee9a03866c720c14bf86f9e/index.ja.md
themes/blowfish/exampleSite/content/users/64-02c452502ee9a03866c720c14bf86f9e/index.it.md
themes/blowfish/exampleSite/content/users/64-02c452502ee9a03866c720c14bf86f9e/index.fr.md
themes/blowfish/exampleSite/content/users/64-02c452502ee9a03866c720c14bf86f9e/index.pt-pt.md
themes/blowfish/exampleSite/content/users/64-02c452502ee9a03866c720c14bf86f9e/feature.webp
themes/blowfish/exampleSite/content/users/64-02c452502ee9a03866c720c14bf86f9e/index.zh-cn.md
themes/blowfish/exampleSite/content/users/9-6c20c1af90023ed60919801cfba0f08f/index.fr.md
themes/blowfish/exampleSite/content/users/9-6c20c1af90023ed60919801cfba0f08f/index.pt-pt.md
themes/blowfish/exampleSite/content/users/9-6c20c1af90023ed60919801cfba0f08f/feature.webp
themes/blowfish/exampleSite/content/users/9-6c20c1af90023ed60919801cfba0f08f/index.zh-cn.md
themes/blowfish/exampleSite/content/users/9-6c20c1af90023ed60919801cfba0f08f/index.ja.md
themes/blowfish/exampleSite/content/users/9-6c20c1af90023ed60919801cfba0f08f/index.it.md
themes/blowfish/exampleSite/content/users/9-6c20c1af90023ed60919801cfba0f08f/index.de.md
themes/blowfish/exampleSite/content/users/9-6c20c1af90023ed60919801cfba0f08f/index.es.md
themes/blowfish/exampleSite/content/users/9-6c20c1af90023ed60919801cfba0f08f/index.md
themes/blowfish/exampleSite/content/users/9-6c20c1af90023ed60919801cfba0f08f/index.pt-br.md
themes/blowfish/exampleSite/content/users/87-405727a6fae1350173ef8915b4c9eb7d/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/series/featured.svg
themes/blowfish/exampleSite/content/docs/series/index.pt-br.md
themes/blowfish/exampleSite/content/docs/series/index.md
themes/blowfish/exampleSite/content/docs/series/index.de.md
themes/blowfish/exampleSite/content/docs/series/background.svg
themes/blowfish/exampleSite/content/docs/series/index.es.md
themes/blowfish/exampleSite/content/docs/series/index.ja.md
themes/blowfish/exampleSite/content/docs/series/index.it.md
themes/blowfish/exampleSite/content/docs/series/index.fr.md
themes/blowfish/exampleSite/content/docs/series/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/series/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/_index.fr.md
themes/blowfish/exampleSite/content/docs/_index.ja.md
themes/blowfish/exampleSite/content/docs/_index.zh-cn.md
themes/blowfish/exampleSite/content/docs/_index.de.md
themes/blowfish/exampleSite/content/users/67-af89464ac25ab9445658a3541e623778/index.pt-br.md
themes/blowfish/exampleSite/content/users/67-af89464ac25ab9445658a3541e623778/index.md
themes/blowfish/exampleSite/content/users/67-af89464ac25ab9445658a3541e623778/index.de.md
themes/blowfish/exampleSite/content/users/67-af89464ac25ab9445658a3541e623778/index.es.md
themes/blowfish/exampleSite/content/users/67-af89464ac25ab9445658a3541e623778/index.ja.md
themes/blowfish/exampleSite/content/users/67-af89464ac25ab9445658a3541e623778/index.it.md
themes/blowfish/exampleSite/content/users/67-af89464ac25ab9445658a3541e623778/index.fr.md
themes/blowfish/exampleSite/content/users/67-af89464ac25ab9445658a3541e623778/index.pt-pt.md
themes/blowfish/exampleSite/content/users/67-af89464ac25ab9445658a3541e623778/feature.webp
themes/blowfish/exampleSite/content/users/67-af89464ac25ab9445658a3541e623778/index.zh-cn.md
themes/blowfish/exampleSite/content/users/87-405727a6fae1350173ef8915b4c9eb7d/index.pt-br.md
themes/blowfish/exampleSite/content/users/87-405727a6fae1350173ef8915b4c9eb7d/index.md
themes/blowfish/exampleSite/content/users/87-405727a6fae1350173ef8915b4c9eb7d/index.de.md
themes/blowfish/exampleSite/content/users/87-405727a6fae1350173ef8915b4c9eb7d/index.es.md
themes/blowfish/exampleSite/content/users/87-405727a6fae1350173ef8915b4c9eb7d/index.ja.md
themes/blowfish/exampleSite/content/users/87-405727a6fae1350173ef8915b4c9eb7d/index.it.md
themes/blowfish/exampleSite/content/users/87-405727a6fae1350173ef8915b4c9eb7d/index.fr.md
themes/blowfish/exampleSite/content/users/87-405727a6fae1350173ef8915b4c9eb7d/index.pt-pt.md
themes/blowfish/exampleSite/content/users/87-405727a6fae1350173ef8915b4c9eb7d/feature.webp
themes/blowfish/exampleSite/content/users/66-bdd6b2db27fb40b3fa79a37659b2f285/index.it.md
themes/blowfish/exampleSite/content/users/66-bdd6b2db27fb40b3fa79a37659b2f285/index.fr.md
themes/blowfish/exampleSite/content/users/66-bdd6b2db27fb40b3fa79a37659b2f285/index.pt-pt.md
themes/blowfish/exampleSite/content/users/66-bdd6b2db27fb40b3fa79a37659b2f285/feature.webp
themes/blowfish/exampleSite/content/users/66-bdd6b2db27fb40b3fa79a37659b2f285/index.pt-br.md
themes/blowfish/exampleSite/content/users/78-46ea5d4b3698fa18fc0b79faa3d89bef/index.pt-br.md
themes/blowfish/exampleSite/content/users/78-46ea5d4b3698fa18fc0b79faa3d89bef/index.md
themes/blowfish/exampleSite/content/users/66-bdd6b2db27fb40b3fa79a37659b2f285/index.md
themes/blowfish/exampleSite/content/users/78-46ea5d4b3698fa18fc0b79faa3d89bef/index.de.md
themes/blowfish/exampleSite/content/users/66-bdd6b2db27fb40b3fa79a37659b2f285/index.de.md
themes/blowfish/exampleSite/content/users/66-bdd6b2db27fb40b3fa79a37659b2f285/index.zh-cn.md
themes/blowfish/exampleSite/content/users/78-46ea5d4b3698fa18fc0b79faa3d89bef/index.es.md
themes/blowfish/exampleSite/content/users/66-bdd6b2db27fb40b3fa79a37659b2f285/index.es.md
themes/blowfish/exampleSite/content/users/78-46ea5d4b3698fa18fc0b79faa3d89bef/index.ja.md
themes/blowfish/exampleSite/content/users/66-bdd6b2db27fb40b3fa79a37659b2f285/index.ja.md
themes/blowfish/exampleSite/content/users/78-46ea5d4b3698fa18fc0b79faa3d89bef/index.it.md
themes/blowfish/exampleSite/content/users/78-46ea5d4b3698fa18fc0b79faa3d89bef/index.fr.md
themes/blowfish/exampleSite/content/users/78-46ea5d4b3698fa18fc0b79faa3d89bef/index.pt-pt.md
themes/blowfish/exampleSite/content/users/78-46ea5d4b3698fa18fc0b79faa3d89bef/feature.webp
themes/blowfish/exampleSite/content/users/78-46ea5d4b3698fa18fc0b79faa3d89bef/index.zh-cn.md
themes/blowfish/exampleSite/content/users/79-915a897f2ea3ba018728d7dce3540b1b/index.pt-pt.md
themes/blowfish/exampleSite/content/users/79-915a897f2ea3ba018728d7dce3540b1b/index.ja.md
themes/blowfish/exampleSite/content/users/79-915a897f2ea3ba018728d7dce3540b1b/feature.webp
themes/blowfish/exampleSite/content/users/79-915a897f2ea3ba018728d7dce3540b1b/index.it.md
themes/blowfish/exampleSite/content/users/79-915a897f2ea3ba018728d7dce3540b1b/index.zh-cn.md
themes/blowfish/exampleSite/content/users/79-915a897f2ea3ba018728d7dce3540b1b/index.fr.md
themes/blowfish/exampleSite/content/users/79-915a897f2ea3ba018728d7dce3540b1b/index.pt-br.md
themes/blowfish/exampleSite/content/users/79-915a897f2ea3ba018728d7dce3540b1b/index.md
themes/blowfish/exampleSite/content/users/79-915a897f2ea3ba018728d7dce3540b1b/index.de.md
themes/blowfish/exampleSite/content/users/79-915a897f2ea3ba018728d7dce3540b1b/index.es.md
themes/blowfish/exampleSite/content/users/33-4d4fb24dca11a144122fa0bb831d9d03/index.pt-br.md
themes/blowfish/exampleSite/content/users/33-4d4fb24dca11a144122fa0bb831d9d03/index.md
themes/blowfish/exampleSite/content/users/33-4d4fb24dca11a144122fa0bb831d9d03/index.de.md
themes/blowfish/exampleSite/content/users/33-4d4fb24dca11a144122fa0bb831d9d03/index.es.md
themes/blowfish/exampleSite/content/users/39-48ff442c7de299911eab10b72b02cc84/index.pt-br.md
themes/blowfish/exampleSite/content/users/33-4d4fb24dca11a144122fa0bb831d9d03/index.ja.md
themes/blowfish/exampleSite/content/users/33-4d4fb24dca11a144122fa0bb831d9d03/index.it.md
themes/blowfish/exampleSite/content/users/33-4d4fb24dca11a144122fa0bb831d9d03/index.fr.md
themes/blowfish/exampleSite/content/users/33-4d4fb24dca11a144122fa0bb831d9d03/index.pt-pt.md
themes/blowfish/exampleSite/content/users/33-4d4fb24dca11a144122fa0bb831d9d03/feature.webp
themes/blowfish/exampleSite/content/users/33-4d4fb24dca11a144122fa0bb831d9d03/index.zh-cn.md
themes/blowfish/exampleSite/content/users/58-1f94add7b0ba58983ff507632b822401/index.pt-br.md
themes/blowfish/exampleSite/content/users/58-1f94add7b0ba58983ff507632b822401/index.md
themes/blowfish/exampleSite/content/users/58-1f94add7b0ba58983ff507632b822401/index.de.md
themes/blowfish/exampleSite/content/users/58-1f94add7b0ba58983ff507632b822401/index.es.md
themes/blowfish/exampleSite/content/users/58-1f94add7b0ba58983ff507632b822401/index.ja.md
themes/blowfish/exampleSite/content/users/39-48ff442c7de299911eab10b72b02cc84/index.md
themes/blowfish/exampleSite/content/users/58-1f94add7b0ba58983ff507632b822401/index.it.md
themes/blowfish/exampleSite/content/users/39-48ff442c7de299911eab10b72b02cc84/index.de.md
themes/blowfish/exampleSite/content/users/58-1f94add7b0ba58983ff507632b822401/index.fr.md
themes/blowfish/exampleSite/content/users/39-48ff442c7de299911eab10b72b02cc84/index.es.md
themes/blowfish/exampleSite/content/users/58-1f94add7b0ba58983ff507632b822401/index.pt-pt.md
themes/blowfish/exampleSite/content/users/39-48ff442c7de299911eab10b72b02cc84/index.ja.md
themes/blowfish/exampleSite/content/users/58-1f94add7b0ba58983ff507632b822401/feature.webp
themes/blowfish/exampleSite/content/users/39-48ff442c7de299911eab10b72b02cc84/index.it.md
themes/blowfish/exampleSite/content/users/39-48ff442c7de299911eab10b72b02cc84/index.fr.md
themes/blowfish/exampleSite/content/users/58-1f94add7b0ba58983ff507632b822401/index.zh-cn.md
themes/blowfish/exampleSite/content/users/39-48ff442c7de299911eab10b72b02cc84/index.pt-pt.md
themes/blowfish/exampleSite/content/users/39-48ff442c7de299911eab10b72b02cc84/feature.webp
themes/blowfish/exampleSite/content/users/39-48ff442c7de299911eab10b72b02cc84/index.zh-cn.md
themes/blowfish/exampleSite/content/samples/charts/index.pt-br.md
themes/blowfish/exampleSite/content/samples/charts/index.md
themes/blowfish/exampleSite/content/samples/charts/index.de.md
themes/blowfish/exampleSite/content/samples/charts/index.es.md
themes/blowfish/exampleSite/content/samples/charts/index.ja.md
themes/blowfish/exampleSite/content/samples/charts/index.it.md
themes/blowfish/exampleSite/content/samples/charts/index.fr.md
themes/blowfish/exampleSite/content/samples/charts/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/charts/index.zh-cn.md
themes/blowfish/exampleSite/content/users/17-64faf41f22317a170125dd7b2cd642e2/index.pt-br.md
themes/blowfish/exampleSite/content/users/17-64faf41f22317a170125dd7b2cd642e2/index.md
themes/blowfish/exampleSite/content/users/17-64faf41f22317a170125dd7b2cd642e2/index.de.md
themes/blowfish/exampleSite/content/users/17-64faf41f22317a170125dd7b2cd642e2/index.es.md
themes/blowfish/exampleSite/content/users/17-64faf41f22317a170125dd7b2cd642e2/index.ja.md
themes/blowfish/exampleSite/content/users/17-64faf41f22317a170125dd7b2cd642e2/index.it.md
themes/blowfish/exampleSite/content/users/17-64faf41f22317a170125dd7b2cd642e2/index.fr.md
themes/blowfish/exampleSite/content/users/17-64faf41f22317a170125dd7b2cd642e2/index.pt-pt.md
themes/blowfish/exampleSite/content/users/17-64faf41f22317a170125dd7b2cd642e2/feature.webp
themes/blowfish/exampleSite/content/users/17-64faf41f22317a170125dd7b2cd642e2/index.zh-cn.md
themes/blowfish/exampleSite/content/users/69-033c87b7e950b82ea500c552c9523367/index.it.md
themes/blowfish/exampleSite/content/users/69-033c87b7e950b82ea500c552c9523367/index.fr.md
themes/blowfish/exampleSite/content/users/69-033c87b7e950b82ea500c552c9523367/index.pt-pt.md
themes/blowfish/exampleSite/content/users/69-033c87b7e950b82ea500c552c9523367/feature.webp
themes/blowfish/exampleSite/content/users/69-033c87b7e950b82ea500c552c9523367/index.zh-cn.md
themes/blowfish/exampleSite/content/users/69-033c87b7e950b82ea500c552c9523367/index.pt-br.md
themes/blowfish/exampleSite/content/users/69-033c87b7e950b82ea500c552c9523367/index.es.md
themes/blowfish/exampleSite/content/users/69-033c87b7e950b82ea500c552c9523367/index.md
themes/blowfish/exampleSite/content/users/69-033c87b7e950b82ea500c552c9523367/index.ja.md
themes/blowfish/exampleSite/content/users/69-033c87b7e950b82ea500c552c9523367/index.de.md
themes/blowfish/exampleSite/content/docs/multi-author/featured.svg
themes/blowfish/exampleSite/content/docs/multi-author/index.pt-br.md
themes/blowfish/exampleSite/content/docs/multi-author/index.md
themes/blowfish/exampleSite/content/docs/multi-author/index.de.md
themes/blowfish/exampleSite/content/docs/multi-author/background.svg
themes/blowfish/exampleSite/content/docs/multi-author/index.es.md
themes/blowfish/exampleSite/content/docs/multi-author/index.ja.md
themes/blowfish/exampleSite/content/docs/multi-author/index.it.md
themes/blowfish/exampleSite/content/users/99-8f0822721042bca88707da31b1c241e3/index.pt-br.md
themes/blowfish/exampleSite/content/users/99-8f0822721042bca88707da31b1c241e3/index.md
themes/blowfish/exampleSite/content/users/99-8f0822721042bca88707da31b1c241e3/index.de.md
themes/blowfish/exampleSite/content/docs/multi-author/index.fr.md
themes/blowfish/exampleSite/content/users/99-8f0822721042bca88707da31b1c241e3/index.es.md
themes/blowfish/exampleSite/content/users/99-8f0822721042bca88707da31b1c241e3/index.ja.md
themes/blowfish/exampleSite/content/docs/multi-author/index.pt-pt.md
themes/blowfish/exampleSite/content/users/99-8f0822721042bca88707da31b1c241e3/index.it.md
themes/blowfish/exampleSite/content/docs/multi-author/index.zh-cn.md
themes/blowfish/exampleSite/content/users/99-8f0822721042bca88707da31b1c241e3/index.fr.md
themes/blowfish/exampleSite/content/users/99-8f0822721042bca88707da31b1c241e3/index.pt-pt.md
themes/blowfish/exampleSite/content/users/99-8f0822721042bca88707da31b1c241e3/feature.webp
themes/blowfish/exampleSite/content/users/99-8f0822721042bca88707da31b1c241e3/index.zh-cn.md
themes/blowfish/exampleSite/content/users/96-6439a010a72c2622487a063185cf1657/index.pt-br.md
themes/blowfish/exampleSite/content/users/109-2496d52e0aa601cbba3ad6572e007d26/index.pt-br.md
themes/blowfish/exampleSite/content/users/109-2496d52e0aa601cbba3ad6572e007d26/index.md
themes/blowfish/exampleSite/content/users/96-6439a010a72c2622487a063185cf1657/index.md
themes/blowfish/exampleSite/content/users/109-2496d52e0aa601cbba3ad6572e007d26/index.de.md
themes/blowfish/exampleSite/content/users/96-6439a010a72c2622487a063185cf1657/index.de.md
themes/blowfish/exampleSite/content/users/109-2496d52e0aa601cbba3ad6572e007d26/index.es.md
themes/blowfish/exampleSite/content/users/96-6439a010a72c2622487a063185cf1657/index.es.md
themes/blowfish/exampleSite/content/users/109-2496d52e0aa601cbba3ad6572e007d26/index.ja.md
themes/blowfish/exampleSite/content/users/96-6439a010a72c2622487a063185cf1657/index.ja.md
themes/blowfish/exampleSite/content/users/109-2496d52e0aa601cbba3ad6572e007d26/index.it.md
themes/blowfish/exampleSite/content/users/96-6439a010a72c2622487a063185cf1657/index.it.md
themes/blowfish/exampleSite/content/users/109-2496d52e0aa601cbba3ad6572e007d26/index.fr.md
themes/blowfish/exampleSite/content/users/96-6439a010a72c2622487a063185cf1657/index.fr.md
themes/blowfish/exampleSite/content/users/109-2496d52e0aa601cbba3ad6572e007d26/index.pt-pt.md
themes/blowfish/exampleSite/content/users/96-6439a010a72c2622487a063185cf1657/index.pt-pt.md
themes/blowfish/exampleSite/content/users/109-2496d52e0aa601cbba3ad6572e007d26/feature.webp
themes/blowfish/exampleSite/content/users/96-6439a010a72c2622487a063185cf1657/feature.webp
themes/blowfish/exampleSite/content/users/109-2496d52e0aa601cbba3ad6572e007d26/index.zh-cn.md
themes/blowfish/exampleSite/content/users/47-4f0c88168fb7a348b4393a56ede2e799/feature.webp
themes/blowfish/exampleSite/content/users/47-4f0c88168fb7a348b4393a56ede2e799/index.zh-cn.md
themes/blowfish/exampleSite/content/users/47-4f0c88168fb7a348b4393a56ede2e799/index.pt-pt.md
themes/blowfish/exampleSite/content/users/47-4f0c88168fb7a348b4393a56ede2e799/index.fr.md
themes/blowfish/exampleSite/content/users/96-6439a010a72c2622487a063185cf1657/index.zh-cn.md
themes/blowfish/exampleSite/content/users/89-9d162f4046cb83c367d8d8ab57240711/feature.webp
themes/blowfish/exampleSite/content/users/89-9d162f4046cb83c367d8d8ab57240711/index.zh-cn.md
themes/blowfish/exampleSite/content/users/_index.ja.md
themes/blowfish/exampleSite/content/users/_index.zh-cn.md
themes/blowfish/exampleSite/content/users/51-e518dc969af1ea65a3d0b55630705047/index.pt-br.md
themes/blowfish/exampleSite/content/users/51-e518dc969af1ea65a3d0b55630705047/index.md
themes/blowfish/exampleSite/content/users/51-e518dc969af1ea65a3d0b55630705047/index.de.md
themes/blowfish/exampleSite/content/users/51-e518dc969af1ea65a3d0b55630705047/index.es.md
themes/blowfish/exampleSite/content/users/51-e518dc969af1ea65a3d0b55630705047/index.ja.md
themes/blowfish/exampleSite/content/users/51-e518dc969af1ea65a3d0b55630705047/index.it.md
themes/blowfish/exampleSite/content/users/89-9d162f4046cb83c367d8d8ab57240711/index.pt-br.md
themes/blowfish/exampleSite/content/users/51-e518dc969af1ea65a3d0b55630705047/index.fr.md
themes/blowfish/exampleSite/content/users/51-e518dc969af1ea65a3d0b55630705047/index.pt-pt.md
themes/blowfish/exampleSite/content/users/89-9d162f4046cb83c367d8d8ab57240711/index.md
themes/blowfish/exampleSite/content/users/51-e518dc969af1ea65a3d0b55630705047/feature.webp
themes/blowfish/exampleSite/content/users/89-9d162f4046cb83c367d8d8ab57240711/index.de.md
themes/blowfish/exampleSite/content/users/51-e518dc969af1ea65a3d0b55630705047/index.zh-cn.md
themes/blowfish/exampleSite/content/users/89-9d162f4046cb83c367d8d8ab57240711/index.es.md
themes/blowfish/exampleSite/content/users/89-9d162f4046cb83c367d8d8ab57240711/index.ja.md
themes/blowfish/exampleSite/content/users/89-9d162f4046cb83c367d8d8ab57240711/index.it.md
themes/blowfish/exampleSite/content/users/89-9d162f4046cb83c367d8d8ab57240711/index.fr.md
themes/blowfish/exampleSite/content/users/89-9d162f4046cb83c367d8d8ab57240711/index.pt-pt.md
themes/blowfish/exampleSite/content/users/31-24577d47b9474b6bc72eba9a6009dba4/index.it.md
themes/blowfish/exampleSite/content/users/31-24577d47b9474b6bc72eba9a6009dba4/index.fr.md
themes/blowfish/exampleSite/content/users/31-24577d47b9474b6bc72eba9a6009dba4/index.pt-pt.md
themes/blowfish/exampleSite/content/users/43-954584ca9b811d77ac600cf7c426be45/index.pt-br.md
themes/blowfish/exampleSite/content/users/43-954584ca9b811d77ac600cf7c426be45/index.md
themes/blowfish/exampleSite/content/users/43-954584ca9b811d77ac600cf7c426be45/index.de.md
themes/blowfish/exampleSite/content/users/43-954584ca9b811d77ac600cf7c426be45/index.es.md
themes/blowfish/exampleSite/content/users/31-24577d47b9474b6bc72eba9a6009dba4/index.pt-br.md
themes/blowfish/exampleSite/content/users/43-954584ca9b811d77ac600cf7c426be45/index.ja.md
themes/blowfish/exampleSite/content/users/43-954584ca9b811d77ac600cf7c426be45/index.it.md
themes/blowfish/exampleSite/content/users/31-24577d47b9474b6bc72eba9a6009dba4/index.md
themes/blowfish/exampleSite/content/users/43-954584ca9b811d77ac600cf7c426be45/index.fr.md
themes/blowfish/exampleSite/content/users/31-24577d47b9474b6bc72eba9a6009dba4/index.de.md
themes/blowfish/exampleSite/content/users/43-954584ca9b811d77ac600cf7c426be45/index.pt-pt.md
themes/blowfish/exampleSite/content/users/31-24577d47b9474b6bc72eba9a6009dba4/feature.webp
themes/blowfish/exampleSite/content/users/31-24577d47b9474b6bc72eba9a6009dba4/index.es.md
themes/blowfish/exampleSite/content/users/43-954584ca9b811d77ac600cf7c426be45/feature.webp
themes/blowfish/exampleSite/content/users/31-24577d47b9474b6bc72eba9a6009dba4/index.ja.md
themes/blowfish/exampleSite/content/users/43-954584ca9b811d77ac600cf7c426be45/index.zh-cn.md
themes/blowfish/exampleSite/content/users/31-24577d47b9474b6bc72eba9a6009dba4/index.zh-cn.md
themes/blowfish/exampleSite/content/samples/rich-content/index.pt-br.md
themes/blowfish/exampleSite/content/samples/rich-content/index.md
themes/blowfish/exampleSite/content/samples/rich-content/index.de.md
themes/blowfish/exampleSite/content/samples/rich-content/index.es.md
themes/blowfish/exampleSite/content/samples/rich-content/index.ja.md
themes/blowfish/exampleSite/content/samples/rich-content/index.it.md
themes/blowfish/exampleSite/content/samples/rich-content/index.fr.md
themes/blowfish/exampleSite/content/samples/rich-content/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/rich-content/index.zh-cn.md
themes/blowfish/exampleSite/content/samples/_index.md
themes/blowfish/exampleSite/content/samples/_index.it.md
themes/blowfish/exampleSite/content/users/48-82b432ad2bfc873ec725001f0b3ac495/index.pt-br.md
themes/blowfish/exampleSite/content/users/48-82b432ad2bfc873ec725001f0b3ac495/index.md
themes/blowfish/exampleSite/content/users/21-6ed0dcb17b6e24c166f7da0bdfb0c1f5/index.pt-br.md
themes/blowfish/exampleSite/content/users/48-82b432ad2bfc873ec725001f0b3ac495/index.de.md
themes/blowfish/exampleSite/content/users/21-6ed0dcb17b6e24c166f7da0bdfb0c1f5/index.md
themes/blowfish/exampleSite/content/users/48-82b432ad2bfc873ec725001f0b3ac495/index.es.md
themes/blowfish/exampleSite/content/users/48-82b432ad2bfc873ec725001f0b3ac495/index.ja.md
themes/blowfish/exampleSite/content/users/48-82b432ad2bfc873ec725001f0b3ac495/index.it.md
themes/blowfish/exampleSite/content/users/21-6ed0dcb17b6e24c166f7da0bdfb0c1f5/index.de.md
themes/blowfish/exampleSite/content/users/48-82b432ad2bfc873ec725001f0b3ac495/index.fr.md
themes/blowfish/exampleSite/content/users/21-6ed0dcb17b6e24c166f7da0bdfb0c1f5/index.es.md
themes/blowfish/exampleSite/content/users/48-82b432ad2bfc873ec725001f0b3ac495/index.pt-pt.md
themes/blowfish/exampleSite/content/users/21-6ed0dcb17b6e24c166f7da0bdfb0c1f5/index.ja.md
themes/blowfish/exampleSite/content/users/48-82b432ad2bfc873ec725001f0b3ac495/feature.webp
themes/blowfish/exampleSite/content/users/21-6ed0dcb17b6e24c166f7da0bdfb0c1f5/index.it.md
themes/blowfish/exampleSite/content/users/48-82b432ad2bfc873ec725001f0b3ac495/index.zh-cn.md
themes/blowfish/exampleSite/content/users/21-6ed0dcb17b6e24c166f7da0bdfb0c1f5/index.fr.md
themes/blowfish/exampleSite/content/users/21-6ed0dcb17b6e24c166f7da0bdfb0c1f5/index.pt-pt.md
themes/blowfish/exampleSite/content/users/21-6ed0dcb17b6e24c166f7da0bdfb0c1f5/feature.webp
themes/blowfish/exampleSite/content/users/21-6ed0dcb17b6e24c166f7da0bdfb0c1f5/index.zh-cn.md
themes/blowfish/exampleSite/content/users/65-d52c3523ad809eb1d9ddbcbe32e92661/index.pt-br.md
themes/blowfish/exampleSite/content/users/65-d52c3523ad809eb1d9ddbcbe32e92661/index.md
themes/blowfish/exampleSite/content/users/65-d52c3523ad809eb1d9ddbcbe32e92661/index.de.md
themes/blowfish/exampleSite/content/users/65-d52c3523ad809eb1d9ddbcbe32e92661/index.es.md
themes/blowfish/exampleSite/content/users/65-d52c3523ad809eb1d9ddbcbe32e92661/index.ja.md
themes/blowfish/exampleSite/content/users/65-d52c3523ad809eb1d9ddbcbe32e92661/index.it.md
themes/blowfish/exampleSite/content/users/65-d52c3523ad809eb1d9ddbcbe32e92661/index.fr.md
themes/blowfish/exampleSite/content/users/65-d52c3523ad809eb1d9ddbcbe32e92661/index.pt-pt.md
themes/blowfish/exampleSite/content/users/65-d52c3523ad809eb1d9ddbcbe32e92661/feature.webp
themes/blowfish/exampleSite/content/users/65-d52c3523ad809eb1d9ddbcbe32e92661/index.zh-cn.md
themes/blowfish/exampleSite/content/users/47-4f0c88168fb7a348b4393a56ede2e799/index.pt-br.md
themes/blowfish/exampleSite/content/users/47-4f0c88168fb7a348b4393a56ede2e799/index.md
themes/blowfish/exampleSite/content/users/47-4f0c88168fb7a348b4393a56ede2e799/index.de.md
themes/blowfish/exampleSite/content/users/47-4f0c88168fb7a348b4393a56ede2e799/index.es.md
themes/blowfish/exampleSite/content/users/47-4f0c88168fb7a348b4393a56ede2e799/index.ja.md
themes/blowfish/exampleSite/content/users/47-4f0c88168fb7a348b4393a56ede2e799/index.it.md
themes/blowfish/exampleSite/content/users/81-2d29fadfaf8ddfaee0b69b563bae8d2d/index.pt-br.md
themes/blowfish/exampleSite/content/users/81-2d29fadfaf8ddfaee0b69b563bae8d2d/index.md
themes/blowfish/exampleSite/content/users/81-2d29fadfaf8ddfaee0b69b563bae8d2d/index.de.md
themes/blowfish/exampleSite/content/users/81-2d29fadfaf8ddfaee0b69b563bae8d2d/index.es.md
themes/blowfish/exampleSite/content/users/81-2d29fadfaf8ddfaee0b69b563bae8d2d/index.ja.md
themes/blowfish/exampleSite/content/users/81-2d29fadfaf8ddfaee0b69b563bae8d2d/index.it.md
themes/blowfish/exampleSite/content/users/81-2d29fadfaf8ddfaee0b69b563bae8d2d/index.fr.md
themes/blowfish/exampleSite/content/users/81-2d29fadfaf8ddfaee0b69b563bae8d2d/index.pt-pt.md
themes/blowfish/exampleSite/content/users/81-2d29fadfaf8ddfaee0b69b563bae8d2d/feature.webp
themes/blowfish/exampleSite/content/users/81-2d29fadfaf8ddfaee0b69b563bae8d2d/index.zh-cn.md
themes/blowfish/exampleSite/content/users/42-fec44f5dd2be29e37c305696d018f99f/index.zh-cn.md
themes/blowfish/exampleSite/content/users/44-8032d46bf9c96ae4b59c419032c7ad89/index.fr.md
themes/blowfish/exampleSite/content/users/44-8032d46bf9c96ae4b59c419032c7ad89/index.pt-pt.md
themes/blowfish/exampleSite/content/users/44-8032d46bf9c96ae4b59c419032c7ad89/feature.webp
themes/blowfish/exampleSite/content/users/44-8032d46bf9c96ae4b59c419032c7ad89/index.zh-cn.md
themes/blowfish/exampleSite/content/users/44-8032d46bf9c96ae4b59c419032c7ad89/index.es.md
themes/blowfish/exampleSite/content/users/44-8032d46bf9c96ae4b59c419032c7ad89/index.ja.md
themes/blowfish/exampleSite/content/users/44-8032d46bf9c96ae4b59c419032c7ad89/index.it.md
themes/blowfish/exampleSite/content/users/44-8032d46bf9c96ae4b59c419032c7ad89/index.de.md
themes/blowfish/exampleSite/content/users/44-8032d46bf9c96ae4b59c419032c7ad89/index.md
themes/blowfish/exampleSite/content/users/68-c562b0e606584dd96159faf763291fe1/index.it.md
themes/blowfish/exampleSite/content/docs/advanced-customisation/featured.svg
themes/blowfish/exampleSite/content/users/68-c562b0e606584dd96159faf763291fe1/index.fr.md
themes/blowfish/exampleSite/content/users/68-c562b0e606584dd96159faf763291fe1/index.pt-br.md
themes/blowfish/exampleSite/content/docs/advanced-customisation/index.pt-br.md
themes/blowfish/exampleSite/content/users/68-c562b0e606584dd96159faf763291fe1/index.pt-pt.md
themes/blowfish/exampleSite/content/users/68-c562b0e606584dd96159faf763291fe1/index.md
themes/blowfish/exampleSite/content/docs/advanced-customisation/index.md
themes/blowfish/exampleSite/content/users/68-c562b0e606584dd96159faf763291fe1/feature.webp
themes/blowfish/exampleSite/content/docs/advanced-customisation/index.de.md
themes/blowfish/exampleSite/content/users/68-c562b0e606584dd96159faf763291fe1/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/advanced-customisation/background.svg
themes/blowfish/exampleSite/content/users/44-8032d46bf9c96ae4b59c419032c7ad89/index.pt-br.md
themes/blowfish/exampleSite/content/users/68-c562b0e606584dd96159faf763291fe1/index.ja.md
themes/blowfish/exampleSite/content/users/68-c562b0e606584dd96159faf763291fe1/index.es.md
themes/blowfish/exampleSite/content/docs/advanced-customisation/index.es.md
themes/blowfish/exampleSite/content/docs/advanced-customisation/index.ja.md
themes/blowfish/exampleSite/content/docs/advanced-customisation/index.it.md
themes/blowfish/exampleSite/content/docs/advanced-customisation/index.fr.md
themes/blowfish/exampleSite/content/docs/advanced-customisation/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/advanced-customisation/index.zh-cn.md
themes/blowfish/exampleSite/content/users/68-c562b0e606584dd96159faf763291fe1/index.de.md
themes/blowfish/exampleSite/content/users/42-fec44f5dd2be29e37c305696d018f99f/index.it.md
themes/blowfish/exampleSite/content/users/63-c506ded8078df151fc8ce943e7ac1c8a/feature.webp
themes/blowfish/exampleSite/content/users/42-fec44f5dd2be29e37c305696d018f99f/index.fr.md
themes/blowfish/exampleSite/content/users/63-c506ded8078df151fc8ce943e7ac1c8a/index.zh-cn.md
themes/blowfish/exampleSite/content/users/42-fec44f5dd2be29e37c305696d018f99f/index.pt-pt.md
themes/blowfish/exampleSite/content/users/42-fec44f5dd2be29e37c305696d018f99f/feature.webp
themes/blowfish/exampleSite/content/users/92-512ff0768813ae318d569f681cf49123/index.pt-br.md
themes/blowfish/exampleSite/content/users/92-512ff0768813ae318d569f681cf49123/index.md
themes/blowfish/exampleSite/content/users/92-512ff0768813ae318d569f681cf49123/index.de.md
themes/blowfish/exampleSite/content/users/92-512ff0768813ae318d569f681cf49123/index.es.md
themes/blowfish/exampleSite/content/users/92-512ff0768813ae318d569f681cf49123/index.ja.md
themes/blowfish/exampleSite/content/users/92-512ff0768813ae318d569f681cf49123/index.it.md
themes/blowfish/exampleSite/content/users/92-512ff0768813ae318d569f681cf49123/index.fr.md
themes/blowfish/exampleSite/content/users/92-512ff0768813ae318d569f681cf49123/index.pt-pt.md
themes/blowfish/exampleSite/content/users/92-512ff0768813ae318d569f681cf49123/feature.webp
themes/blowfish/exampleSite/content/users/92-512ff0768813ae318d569f681cf49123/index.zh-cn.md
themes/blowfish/exampleSite/content/users/42-fec44f5dd2be29e37c305696d018f99f/index.pt-br.md
themes/blowfish/exampleSite/content/users/42-fec44f5dd2be29e37c305696d018f99f/index.md
themes/blowfish/exampleSite/content/users/42-fec44f5dd2be29e37c305696d018f99f/index.de.md
themes/blowfish/exampleSite/content/users/42-fec44f5dd2be29e37c305696d018f99f/index.es.md
themes/blowfish/exampleSite/content/users/42-fec44f5dd2be29e37c305696d018f99f/index.ja.md
themes/blowfish/exampleSite/content/users/63-c506ded8078df151fc8ce943e7ac1c8a/index.it.md
themes/blowfish/exampleSite/content/users/63-c506ded8078df151fc8ce943e7ac1c8a/index.fr.md
themes/blowfish/exampleSite/content/users/63-c506ded8078df151fc8ce943e7ac1c8a/index.pt-pt.md
themes/blowfish/exampleSite/content/users/63-c506ded8078df151fc8ce943e7ac1c8a/index.es.md
themes/blowfish/exampleSite/content/users/63-c506ded8078df151fc8ce943e7ac1c8a/index.ja.md
themes/blowfish/exampleSite/content/users/63-c506ded8078df151fc8ce943e7ac1c8a/index.de.md
themes/blowfish/exampleSite/content/users/63-c506ded8078df151fc8ce943e7ac1c8a/index.pt-br.md
themes/blowfish/exampleSite/content/users/63-c506ded8078df151fc8ce943e7ac1c8a/index.md
themes/blowfish/exampleSite/content/samples/diagrams-flowcharts/index.pt-br.md
themes/blowfish/exampleSite/content/samples/diagrams-flowcharts/index.md
themes/blowfish/exampleSite/content/samples/diagrams-flowcharts/index.de.md
themes/blowfish/exampleSite/content/samples/diagrams-flowcharts/index.es.md
themes/blowfish/exampleSite/content/samples/diagrams-flowcharts/index.ja.md
themes/blowfish/exampleSite/content/samples/diagrams-flowcharts/index.it.md
themes/blowfish/exampleSite/content/samples/diagrams-flowcharts/index.fr.md
themes/blowfish/exampleSite/content/samples/diagrams-flowcharts/index.pt-pt.md
themes/blowfish/exampleSite/content/samples/diagrams-flowcharts/index.zh-cn.md
themes/blowfish/exampleSite/content/users/36-43d57d92cc54037519270a0cb07dbb83/index.pt-br.md
themes/blowfish/exampleSite/content/users/36-43d57d92cc54037519270a0cb07dbb83/index.md
themes/blowfish/exampleSite/content/users/36-43d57d92cc54037519270a0cb07dbb83/index.de.md
themes/blowfish/exampleSite/content/users/36-43d57d92cc54037519270a0cb07dbb83/index.es.md
themes/blowfish/exampleSite/content/users/36-43d57d92cc54037519270a0cb07dbb83/index.ja.md
themes/blowfish/exampleSite/content/users/36-43d57d92cc54037519270a0cb07dbb83/index.it.md
themes/blowfish/exampleSite/content/users/36-43d57d92cc54037519270a0cb07dbb83/index.fr.md
themes/blowfish/exampleSite/content/users/36-43d57d92cc54037519270a0cb07dbb83/index.pt-pt.md
themes/blowfish/exampleSite/content/users/36-43d57d92cc54037519270a0cb07dbb83/feature.webp
themes/blowfish/exampleSite/content/users/36-43d57d92cc54037519270a0cb07dbb83/index.zh-cn.md
themes/blowfish/exampleSite/content/users/_index.de.md
themes/blowfish/exampleSite/content/users/45-b66472425d53d4e270e85ba4f160e7a1/index.pt-br.md
themes/blowfish/exampleSite/content/users/45-b66472425d53d4e270e85ba4f160e7a1/index.md
themes/blowfish/exampleSite/content/users/45-b66472425d53d4e270e85ba4f160e7a1/index.de.md
themes/blowfish/exampleSite/content/users/45-b66472425d53d4e270e85ba4f160e7a1/index.es.md
themes/blowfish/exampleSite/content/users/45-b66472425d53d4e270e85ba4f160e7a1/index.ja.md
themes/blowfish/exampleSite/content/users/45-b66472425d53d4e270e85ba4f160e7a1/index.it.md
themes/blowfish/exampleSite/content/users/45-b66472425d53d4e270e85ba4f160e7a1/index.fr.md
themes/blowfish/exampleSite/content/users/45-b66472425d53d4e270e85ba4f160e7a1/index.pt-pt.md
themes/blowfish/exampleSite/content/users/45-b66472425d53d4e270e85ba4f160e7a1/feature.webp
themes/blowfish/exampleSite/content/users/45-b66472425d53d4e270e85ba4f160e7a1/index.zh-cn.md
themes/blowfish/exampleSite/content/users/50-427cec3309be77abe6f19b006b2a3dc0/index.pt-br.md
themes/blowfish/exampleSite/content/users/50-427cec3309be77abe6f19b006b2a3dc0/index.md
themes/blowfish/exampleSite/content/users/50-427cec3309be77abe6f19b006b2a3dc0/index.de.md
themes/blowfish/exampleSite/content/users/50-427cec3309be77abe6f19b006b2a3dc0/index.es.md
themes/blowfish/exampleSite/content/users/50-427cec3309be77abe6f19b006b2a3dc0/index.ja.md
themes/blowfish/exampleSite/content/users/50-427cec3309be77abe6f19b006b2a3dc0/index.it.md
themes/blowfish/exampleSite/content/users/50-427cec3309be77abe6f19b006b2a3dc0/index.fr.md
themes/blowfish/exampleSite/content/users/50-427cec3309be77abe6f19b006b2a3dc0/index.pt-pt.md
themes/blowfish/exampleSite/content/users/50-427cec3309be77abe6f19b006b2a3dc0/feature.webp
themes/blowfish/exampleSite/content/users/50-427cec3309be77abe6f19b006b2a3dc0/index.zh-cn.md
themes/blowfish/exampleSite/content/users/13-72d71e304faaa40b3d547d5357edc450/feature.webp
themes/blowfish/exampleSite/content/users/13-72d71e304faaa40b3d547d5357edc450/index.zh-cn.md
themes/blowfish/exampleSite/content/users/13-72d71e304faaa40b3d547d5357edc450/index.pt-pt.md
themes/blowfish/exampleSite/content/users/13-72d71e304faaa40b3d547d5357edc450/index.fr.md
themes/blowfish/exampleSite/content/users/28-5801e67070cd59e592c82693a1bda773/feature.webp
themes/blowfish/exampleSite/content/users/28-5801e67070cd59e592c82693a1bda773/index.zh-cn.md
themes/blowfish/exampleSite/content/users/28-5801e67070cd59e592c82693a1bda773/index.pt-pt.md
themes/blowfish/exampleSite/content/users/28-5801e67070cd59e592c82693a1bda773/index.fr.md
themes/blowfish/exampleSite/content/users/54-1314bf3d7ce70ad90f1fc7666032e147/index.pt-br.md
themes/blowfish/exampleSite/content/users/54-1314bf3d7ce70ad90f1fc7666032e147/index.md
themes/blowfish/exampleSite/content/users/54-1314bf3d7ce70ad90f1fc7666032e147/index.de.md
themes/blowfish/exampleSite/content/users/54-1314bf3d7ce70ad90f1fc7666032e147/index.es.md
themes/blowfish/exampleSite/content/users/54-1314bf3d7ce70ad90f1fc7666032e147/index.ja.md
themes/blowfish/exampleSite/content/users/54-1314bf3d7ce70ad90f1fc7666032e147/index.it.md
themes/blowfish/exampleSite/content/users/54-1314bf3d7ce70ad90f1fc7666032e147/index.fr.md
themes/blowfish/exampleSite/content/users/54-1314bf3d7ce70ad90f1fc7666032e147/index.pt-pt.md
themes/blowfish/exampleSite/content/users/54-1314bf3d7ce70ad90f1fc7666032e147/feature.webp
themes/blowfish/exampleSite/content/users/54-1314bf3d7ce70ad90f1fc7666032e147/index.zh-cn.md
themes/blowfish/exampleSite/content/users/28-5801e67070cd59e592c82693a1bda773/index.pt-br.md
themes/blowfish/exampleSite/content/users/28-5801e67070cd59e592c82693a1bda773/index.md
themes/blowfish/exampleSite/content/users/28-5801e67070cd59e592c82693a1bda773/index.de.md
themes/blowfish/exampleSite/content/users/28-5801e67070cd59e592c82693a1bda773/index.es.md
themes/blowfish/exampleSite/content/users/28-5801e67070cd59e592c82693a1bda773/index.ja.md
themes/blowfish/exampleSite/content/users/28-5801e67070cd59e592c82693a1bda773/index.it.md
themes/blowfish/exampleSite/content/users/13-72d71e304faaa40b3d547d5357edc450/index.pt-br.md
themes/blowfish/exampleSite/content/users/80-0805e986c2f7265e3bbbfc7bc647ed92/index.pt-br.md
themes/blowfish/exampleSite/content/users/22-e2ca3d6494c32151235beabe7567b23d/index.fr.md
themes/blowfish/exampleSite/content/users/22-e2ca3d6494c32151235beabe7567b23d/index.pt-pt.md
themes/blowfish/exampleSite/content/users/13-72d71e304faaa40b3d547d5357edc450/index.md
themes/blowfish/exampleSite/content/users/22-e2ca3d6494c32151235beabe7567b23d/feature.webp
themes/blowfish/exampleSite/content/users/22-e2ca3d6494c32151235beabe7567b23d/index.zh-cn.md
themes/blowfish/exampleSite/content/users/13-72d71e304faaa40b3d547d5357edc450/index.de.md
themes/blowfish/exampleSite/content/users/80-0805e986c2f7265e3bbbfc7bc647ed92/index.md
themes/blowfish/exampleSite/content/users/22-e2ca3d6494c32151235beabe7567b23d/index.ja.md
themes/blowfish/exampleSite/content/users/13-72d71e304faaa40b3d547d5357edc450/index.es.md
themes/blowfish/exampleSite/content/users/80-0805e986c2f7265e3bbbfc7bc647ed92/index.de.md
themes/blowfish/exampleSite/content/users/22-e2ca3d6494c32151235beabe7567b23d/index.it.md
themes/blowfish/exampleSite/content/users/13-72d71e304faaa40b3d547d5357edc450/index.ja.md
themes/blowfish/exampleSite/content/users/80-0805e986c2f7265e3bbbfc7bc647ed92/index.es.md
themes/blowfish/exampleSite/content/users/22-e2ca3d6494c32151235beabe7567b23d/index.es.md
themes/blowfish/exampleSite/content/users/13-72d71e304faaa40b3d547d5357edc450/index.it.md
themes/blowfish/exampleSite/content/users/80-0805e986c2f7265e3bbbfc7bc647ed92/index.ja.md
themes/blowfish/exampleSite/content/users/27-66a61706d45b77b559869cd1247fe8fc/index.pt-pt.md
themes/blowfish/exampleSite/content/users/27-66a61706d45b77b559869cd1247fe8fc/feature.webp
themes/blowfish/exampleSite/content/users/27-66a61706d45b77b559869cd1247fe8fc/index.zh-cn.md
themes/blowfish/exampleSite/content/users/22-e2ca3d6494c32151235beabe7567b23d/index.md
themes/blowfish/exampleSite/content/users/27-66a61706d45b77b559869cd1247fe8fc/index.it.md
themes/blowfish/exampleSite/content/users/27-66a61706d45b77b559869cd1247fe8fc/index.fr.md
themes/blowfish/exampleSite/content/users/27-66a61706d45b77b559869cd1247fe8fc/index.ja.md
themes/blowfish/exampleSite/content/users/27-66a61706d45b77b559869cd1247fe8fc/index.es.md
themes/blowfish/exampleSite/content/users/80-0805e986c2f7265e3bbbfc7bc647ed92/feature.webp
themes/blowfish/exampleSite/content/users/80-0805e986c2f7265e3bbbfc7bc647ed92/index.zh-cn.md
themes/blowfish/exampleSite/content/users/22-e2ca3d6494c32151235beabe7567b23d/index.de.md
themes/blowfish/exampleSite/content/users/22-e2ca3d6494c32151235beabe7567b23d/index.pt-br.md
themes/blowfish/exampleSite/content/users/80-0805e986c2f7265e3bbbfc7bc647ed92/index.it.md
themes/blowfish/exampleSite/content/users/80-0805e986c2f7265e3bbbfc7bc647ed92/index.pt-pt.md
themes/blowfish/exampleSite/content/users/80-0805e986c2f7265e3bbbfc7bc647ed92/index.fr.md
themes/blowfish/exampleSite/content/users/27-66a61706d45b77b559869cd1247fe8fc/index.de.md
themes/blowfish/exampleSite/content/users/27-66a61706d45b77b559869cd1247fe8fc/index.md
themes/blowfish/exampleSite/content/users/27-66a61706d45b77b559869cd1247fe8fc/index.pt-br.md
themes/blowfish/exampleSite/content/users/14-1a882ded73613252bb07c2c13f40b9e3/index.zh-cn.md
themes/blowfish/exampleSite/content/_index.fr.md
themes/blowfish/exampleSite/content/_index.ja.md
themes/blowfish/exampleSite/content/_index.zh-cn.md
themes/blowfish/exampleSite/content/_index.de.md
themes/blowfish/exampleSite/content/users/46-3ec093539269bc4ce9498fe9c36a2b7d/index.pt-br.md
themes/blowfish/exampleSite/content/users/46-3ec093539269bc4ce9498fe9c36a2b7d/index.md
themes/blowfish/exampleSite/content/users/46-3ec093539269bc4ce9498fe9c36a2b7d/index.de.md
themes/blowfish/exampleSite/content/users/46-3ec093539269bc4ce9498fe9c36a2b7d/index.es.md
themes/blowfish/exampleSite/content/users/46-3ec093539269bc4ce9498fe9c36a2b7d/index.ja.md
themes/blowfish/exampleSite/content/users/46-3ec093539269bc4ce9498fe9c36a2b7d/index.it.md
themes/blowfish/exampleSite/content/users/46-3ec093539269bc4ce9498fe9c36a2b7d/index.fr.md
themes/blowfish/exampleSite/content/users/46-3ec093539269bc4ce9498fe9c36a2b7d/index.pt-pt.md
themes/blowfish/exampleSite/content/users/46-3ec093539269bc4ce9498fe9c36a2b7d/feature.webp
themes/blowfish/exampleSite/content/users/46-3ec093539269bc4ce9498fe9c36a2b7d/index.zh-cn.md
themes/blowfish/exampleSite/content/users/14-1a882ded73613252bb07c2c13f40b9e3/index.pt-br.md
themes/blowfish/exampleSite/content/users/14-1a882ded73613252bb07c2c13f40b9e3/index.md
themes/blowfish/exampleSite/content/users/14-1a882ded73613252bb07c2c13f40b9e3/index.de.md
themes/blowfish/exampleSite/content/users/14-1a882ded73613252bb07c2c13f40b9e3/index.es.md
themes/blowfish/exampleSite/content/users/14-1a882ded73613252bb07c2c13f40b9e3/index.ja.md
themes/blowfish/exampleSite/content/users/14-1a882ded73613252bb07c2c13f40b9e3/index.it.md
themes/blowfish/exampleSite/content/users/14-1a882ded73613252bb07c2c13f40b9e3/index.fr.md
themes/blowfish/exampleSite/content/users/14-1a882ded73613252bb07c2c13f40b9e3/index.pt-pt.md
themes/blowfish/exampleSite/content/users/14-1a882ded73613252bb07c2c13f40b9e3/feature.webp
themes/blowfish/exampleSite/content/examples/_index.pt-pt.md
themes/blowfish/exampleSite/content/docs/front-matter/featured.svg
themes/blowfish/exampleSite/content/docs/front-matter/index.pt-br.md
themes/blowfish/exampleSite/content/docs/front-matter/index.md
themes/blowfish/exampleSite/content/docs/front-matter/index.de.md
themes/blowfish/exampleSite/content/docs/front-matter/background.svg
themes/blowfish/exampleSite/content/docs/front-matter/index.es.md
themes/blowfish/exampleSite/content/docs/front-matter/index.ja.md
themes/blowfish/exampleSite/content/docs/front-matter/index.it.md
themes/blowfish/exampleSite/content/docs/front-matter/index.fr.md
themes/blowfish/exampleSite/content/docs/front-matter/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/front-matter/index.zh-cn.md
themes/blowfish/exampleSite/content/examples/_index.pt-br.md
themes/blowfish/exampleSite/content/users/3-9d028495840ad385e6cb3ccf051dca22/index.pt-br.md
themes/blowfish/exampleSite/content/users/3-9d028495840ad385e6cb3ccf051dca22/index.md
themes/blowfish/exampleSite/content/users/3-9d028495840ad385e6cb3ccf051dca22/index.de.md
themes/blowfish/exampleSite/content/users/3-9d028495840ad385e6cb3ccf051dca22/index.es.md
themes/blowfish/exampleSite/content/users/3-9d028495840ad385e6cb3ccf051dca22/index.ja.md
themes/blowfish/exampleSite/content/users/3-9d028495840ad385e6cb3ccf051dca22/index.it.md
themes/blowfish/exampleSite/content/users/3-9d028495840ad385e6cb3ccf051dca22/index.fr.md
themes/blowfish/exampleSite/content/users/88-a615163aad4c6bb5746a697a9450d563/index.pt-br.md
themes/blowfish/exampleSite/content/users/88-a615163aad4c6bb5746a697a9450d563/index.md
themes/blowfish/exampleSite/content/users/88-a615163aad4c6bb5746a697a9450d563/index.de.md
themes/blowfish/exampleSite/content/users/88-a615163aad4c6bb5746a697a9450d563/index.es.md
themes/blowfish/exampleSite/content/users/88-a615163aad4c6bb5746a697a9450d563/index.ja.md
themes/blowfish/exampleSite/content/users/88-a615163aad4c6bb5746a697a9450d563/index.it.md
themes/blowfish/exampleSite/content/users/88-a615163aad4c6bb5746a697a9450d563/index.fr.md
themes/blowfish/exampleSite/content/users/88-a615163aad4c6bb5746a697a9450d563/index.pt-pt.md
themes/blowfish/exampleSite/content/users/88-a615163aad4c6bb5746a697a9450d563/feature.webp
themes/blowfish/exampleSite/content/users/88-a615163aad4c6bb5746a697a9450d563/index.zh-cn.md
themes/blowfish/exampleSite/content/users/3-9d028495840ad385e6cb3ccf051dca22/index.pt-pt.md
themes/blowfish/exampleSite/content/users/3-9d028495840ad385e6cb3ccf051dca22/feature.webp
themes/blowfish/exampleSite/content/users/3-9d028495840ad385e6cb3ccf051dca22/index.zh-cn.md
themes/blowfish/exampleSite/content/users/84-a615163aad4c6bb5746a697a9450d563/index.fr.md
themes/blowfish/exampleSite/content/users/84-a615163aad4c6bb5746a697a9450d563/index.pt-pt.md
themes/blowfish/exampleSite/content/users/84-a615163aad4c6bb5746a697a9450d563/feature.webp
themes/blowfish/exampleSite/content/users/84-a615163aad4c6bb5746a697a9450d563/index.zh-cn.md
themes/blowfish/exampleSite/content/users/61-4de384e83ae8af3834cad28f6dfc6966/index.pt-br.md
themes/blowfish/exampleSite/content/users/61-4de384e83ae8af3834cad28f6dfc6966/index.md
themes/blowfish/exampleSite/content/users/61-4de384e83ae8af3834cad28f6dfc6966/index.de.md
themes/blowfish/exampleSite/content/users/61-4de384e83ae8af3834cad28f6dfc6966/index.es.md
themes/blowfish/exampleSite/content/users/61-4de384e83ae8af3834cad28f6dfc6966/index.ja.md
themes/blowfish/exampleSite/content/users/61-4de384e83ae8af3834cad28f6dfc6966/index.it.md
themes/blowfish/exampleSite/content/users/61-4de384e83ae8af3834cad28f6dfc6966/index.fr.md
themes/blowfish/exampleSite/content/users/61-4de384e83ae8af3834cad28f6dfc6966/index.pt-pt.md
themes/blowfish/exampleSite/content/users/61-4de384e83ae8af3834cad28f6dfc6966/feature.webp
themes/blowfish/exampleSite/content/users/84-a615163aad4c6bb5746a697a9450d563/index.pt-br.md
themes/blowfish/exampleSite/content/users/61-4de384e83ae8af3834cad28f6dfc6966/index.zh-cn.md
themes/blowfish/exampleSite/content/users/73-e263f9bb6dcec27003a8f5f947ba5abb/index.pt-br.md
themes/blowfish/exampleSite/content/users/84-a615163aad4c6bb5746a697a9450d563/index.md
themes/blowfish/exampleSite/content/users/73-e263f9bb6dcec27003a8f5f947ba5abb/index.md
themes/blowfish/exampleSite/content/users/84-a615163aad4c6bb5746a697a9450d563/index.de.md
themes/blowfish/exampleSite/content/users/73-e263f9bb6dcec27003a8f5f947ba5abb/index.de.md
themes/blowfish/exampleSite/content/users/84-a615163aad4c6bb5746a697a9450d563/index.es.md
themes/blowfish/exampleSite/content/users/73-e263f9bb6dcec27003a8f5f947ba5abb/index.es.md
themes/blowfish/exampleSite/content/users/84-a615163aad4c6bb5746a697a9450d563/index.ja.md
themes/blowfish/exampleSite/content/users/73-e263f9bb6dcec27003a8f5f947ba5abb/index.ja.md
themes/blowfish/exampleSite/content/users/84-a615163aad4c6bb5746a697a9450d563/index.it.md
themes/blowfish/exampleSite/content/users/73-e263f9bb6dcec27003a8f5f947ba5abb/index.it.md
themes/blowfish/exampleSite/content/users/73-e263f9bb6dcec27003a8f5f947ba5abb/index.fr.md
themes/blowfish/exampleSite/content/users/73-e263f9bb6dcec27003a8f5f947ba5abb/index.pt-pt.md
themes/blowfish/exampleSite/content/users/73-e263f9bb6dcec27003a8f5f947ba5abb/feature.webp
themes/blowfish/exampleSite/content/users/73-e263f9bb6dcec27003a8f5f947ba5abb/index.zh-cn.md
themes/blowfish/exampleSite/content/guides/_index.pt-pt.md
themes/blowfish/exampleSite/content/users/0-e8b2eb823290677fbba3390d5cef2c35/index.pt-pt.md
themes/blowfish/exampleSite/content/users/0-e8b2eb823290677fbba3390d5cef2c35/feature.webp
themes/blowfish/exampleSite/content/users/0-e8b2eb823290677fbba3390d5cef2c35/index.zh-cn.md
themes/blowfish/exampleSite/content/users/0-e8b2eb823290677fbba3390d5cef2c35/index.pt-br.md
themes/blowfish/exampleSite/content/users/0-e8b2eb823290677fbba3390d5cef2c35/index.md
themes/blowfish/exampleSite/content/users/0-e8b2eb823290677fbba3390d5cef2c35/index.de.md
themes/blowfish/exampleSite/content/users/0-e8b2eb823290677fbba3390d5cef2c35/index.es.md
themes/blowfish/exampleSite/content/users/0-e8b2eb823290677fbba3390d5cef2c35/index.ja.md
themes/blowfish/exampleSite/content/users/0-e8b2eb823290677fbba3390d5cef2c35/index.it.md
themes/blowfish/exampleSite/content/users/0-e8b2eb823290677fbba3390d5cef2c35/index.fr.md
themes/blowfish/exampleSite/content/guides/_index.it.md
themes/blowfish/exampleSite/content/guides/_index.md
themes/blowfish/exampleSite/content/guides/_index.zh-cn.md
themes/blowfish/exampleSite/content/guides/_index.pt-br.md
themes/blowfish/exampleSite/content/guides/_index.fr.md
themes/blowfish/exampleSite/content/guides/_index.ja.md
themes/blowfish/exampleSite/content/users/41-d6d2aa4cd9e351e749136df67a27c136/index.pt-br.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-tutorial/_index.pt-br.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-tutorial/_index.fr.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-tutorial/_index.ja.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-tutorial/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-tutorial/_index.de.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-tutorial/featured.jpg
themes/blowfish/exampleSite/content/examples/repo-blowfish-tutorial/_index.es.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-tutorial/_index.pt-pt.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-tutorial/_index.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-tutorial/_index.it.md
themes/blowfish/exampleSite/content/users/41-d6d2aa4cd9e351e749136df67a27c136/index.md
themes/blowfish/exampleSite/content/users/41-d6d2aa4cd9e351e749136df67a27c136/index.de.md
themes/blowfish/exampleSite/content/users/41-d6d2aa4cd9e351e749136df67a27c136/index.es.md
themes/blowfish/exampleSite/content/users/41-d6d2aa4cd9e351e749136df67a27c136/index.ja.md
themes/blowfish/exampleSite/content/users/41-d6d2aa4cd9e351e749136df67a27c136/index.it.md
themes/blowfish/exampleSite/content/users/41-d6d2aa4cd9e351e749136df67a27c136/index.fr.md
themes/blowfish/exampleSite/content/users/41-d6d2aa4cd9e351e749136df67a27c136/index.pt-pt.md
themes/blowfish/exampleSite/content/users/41-d6d2aa4cd9e351e749136df67a27c136/feature.webp
themes/blowfish/exampleSite/content/users/41-d6d2aa4cd9e351e749136df67a27c136/index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-lowkey/_index.pt-br.md
themes/blowfish/exampleSite/content/examples/blowfish-lowkey/_index.fr.md
themes/blowfish/exampleSite/content/examples/blowfish-lowkey/_index.ja.md
themes/blowfish/exampleSite/content/examples/blowfish-lowkey/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-lowkey/_index.de.md
themes/blowfish/exampleSite/content/examples/blowfish-lowkey/featured.jpg
themes/blowfish/exampleSite/content/examples/blowfish-lowkey/_index.es.md
themes/blowfish/exampleSite/content/examples/blowfish-lowkey/_index.pt-pt.md
themes/blowfish/exampleSite/content/examples/blowfish-lowkey/_index.md
themes/blowfish/exampleSite/content/examples/blowfish-lowkey/_index.it.md
themes/blowfish/exampleSite/content/examples/_index.fr.md
themes/blowfish/exampleSite/content/examples/_index.ja.md
themes/blowfish/exampleSite/content/examples/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-template-repo/_index.pt-br.md
themes/blowfish/exampleSite/content/examples/blowfish-template-repo/_index.fr.md
themes/blowfish/exampleSite/content/examples/blowfish-template-repo/_index.ja.md
themes/blowfish/exampleSite/content/examples/blowfish-template-repo/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-template-repo/_index.de.md
themes/blowfish/exampleSite/content/examples/blowfish-template-repo/featured.jpg
themes/blowfish/exampleSite/content/examples/blowfish-template-repo/_index.es.md
themes/blowfish/exampleSite/content/authors/_index.ja.md
themes/blowfish/exampleSite/content/examples/blowfish-template-repo/_index.pt-pt.md
themes/blowfish/exampleSite/content/authors/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-template-repo/_index.md
themes/blowfish/exampleSite/content/examples/blowfish-template-repo/_index.it.md
themes/blowfish/exampleSite/content/users/57-15cf92fba36f0319bd4b176da554fdb9/index.pt-br.md
themes/blowfish/exampleSite/content/users/57-15cf92fba36f0319bd4b176da554fdb9/index.md
themes/blowfish/exampleSite/content/users/57-15cf92fba36f0319bd4b176da554fdb9/index.de.md
themes/blowfish/exampleSite/content/users/57-15cf92fba36f0319bd4b176da554fdb9/index.es.md
themes/blowfish/exampleSite/content/examples/_index.it.md
themes/blowfish/exampleSite/content/users/57-15cf92fba36f0319bd4b176da554fdb9/index.ja.md
themes/blowfish/exampleSite/content/docs/homepage-layout/featured.svg
themes/blowfish/exampleSite/content/examples/_index.md
themes/blowfish/exampleSite/content/users/57-15cf92fba36f0319bd4b176da554fdb9/index.it.md
themes/blowfish/exampleSite/content/users/57-15cf92fba36f0319bd4b176da554fdb9/index.fr.md
themes/blowfish/exampleSite/content/docs/homepage-layout/index.pt-br.md
themes/blowfish/exampleSite/content/users/57-15cf92fba36f0319bd4b176da554fdb9/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/homepage-layout/old.svg
themes/blowfish/exampleSite/content/users/57-15cf92fba36f0319bd4b176da554fdb9/feature.webp
themes/blowfish/exampleSite/content/docs/homepage-layout/a.svg
themes/blowfish/exampleSite/content/users/57-15cf92fba36f0319bd4b176da554fdb9/index.zh-cn.md
themes/blowfish/exampleSite/content/users/20-3bfa5ccb77cf79199527df4c0259d0dc/index.pt-br.md
themes/blowfish/exampleSite/content/users/20-3bfa5ccb77cf79199527df4c0259d0dc/index.md
themes/blowfish/exampleSite/content/users/20-3bfa5ccb77cf79199527df4c0259d0dc/index.de.md
themes/blowfish/exampleSite/content/users/20-3bfa5ccb77cf79199527df4c0259d0dc/index.es.md
themes/blowfish/exampleSite/content/users/20-3bfa5ccb77cf79199527df4c0259d0dc/index.ja.md
themes/blowfish/exampleSite/content/users/20-3bfa5ccb77cf79199527df4c0259d0dc/index.it.md
themes/blowfish/exampleSite/content/users/20-3bfa5ccb77cf79199527df4c0259d0dc/index.fr.md
themes/blowfish/exampleSite/content/users/20-3bfa5ccb77cf79199527df4c0259d0dc/index.pt-pt.md
themes/blowfish/exampleSite/content/users/20-3bfa5ccb77cf79199527df4c0259d0dc/feature.webp
themes/blowfish/exampleSite/content/users/20-3bfa5ccb77cf79199527df4c0259d0dc/index.zh-cn.md
themes/blowfish/exampleSite/content/users/38-9eed597b03512bc7b7b4b3cf81814a37/index.pt-br.md
themes/blowfish/exampleSite/content/users/38-9eed597b03512bc7b7b4b3cf81814a37/index.md
themes/blowfish/exampleSite/content/users/38-9eed597b03512bc7b7b4b3cf81814a37/index.de.md
themes/blowfish/exampleSite/content/users/38-9eed597b03512bc7b7b4b3cf81814a37/index.es.md
themes/blowfish/exampleSite/content/users/38-9eed597b03512bc7b7b4b3cf81814a37/index.ja.md
themes/blowfish/exampleSite/content/users/38-9eed597b03512bc7b7b4b3cf81814a37/index.it.md
themes/blowfish/exampleSite/content/users/38-9eed597b03512bc7b7b4b3cf81814a37/index.fr.md
themes/blowfish/exampleSite/content/users/38-9eed597b03512bc7b7b4b3cf81814a37/index.pt-pt.md
themes/blowfish/exampleSite/content/users/38-9eed597b03512bc7b7b4b3cf81814a37/feature.webp
themes/blowfish/exampleSite/content/users/38-9eed597b03512bc7b7b4b3cf81814a37/index.zh-cn.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/index.pt-br.md
themes/blowfish/exampleSite/content/guides/template/index.pt-br.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-artist/_index.pt-br.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-artist/_index.fr.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-artist/_index.ja.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-artist/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-artist/_index.de.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-artist/featured.jpg
themes/blowfish/exampleSite/content/examples/repo-blowfish-artist/_index.es.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-artist/_index.pt-pt.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-artist/_index.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-artist/_index.it.md
themes/blowfish/exampleSite/content/users/77-3fa4eb553f5d984050d2ee4954960034/index.pt-br.md
themes/blowfish/exampleSite/content/users/77-3fa4eb553f5d984050d2ee4954960034/index.md
themes/blowfish/exampleSite/content/users/77-3fa4eb553f5d984050d2ee4954960034/index.de.md
themes/blowfish/exampleSite/content/users/77-3fa4eb553f5d984050d2ee4954960034/index.es.md
themes/blowfish/exampleSite/content/users/77-3fa4eb553f5d984050d2ee4954960034/index.ja.md
themes/blowfish/exampleSite/content/users/77-3fa4eb553f5d984050d2ee4954960034/index.it.md
themes/blowfish/exampleSite/content/users/77-3fa4eb553f5d984050d2ee4954960034/index.fr.md
themes/blowfish/exampleSite/content/users/77-3fa4eb553f5d984050d2ee4954960034/index.pt-pt.md
themes/blowfish/exampleSite/content/users/77-3fa4eb553f5d984050d2ee4954960034/feature.webp
themes/blowfish/exampleSite/content/users/77-3fa4eb553f5d984050d2ee4954960034/index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-template/_index.pt-br.md
themes/blowfish/exampleSite/content/guides/template/img/example.jpg
themes/blowfish/exampleSite/content/examples/blowfish-template/_index.fr.md
themes/blowfish/exampleSite/content/examples/blowfish-template/_index.ja.md
themes/blowfish/exampleSite/content/examples/blowfish-template/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-template/_index.de.md
themes/blowfish/exampleSite/content/examples/blowfish-template/featured.jpg
themes/blowfish/exampleSite/content/guides/template/featured.jpg
themes/blowfish/exampleSite/content/examples/blowfish-template/_index.es.md
themes/blowfish/exampleSite/content/guides/template/index.md
themes/blowfish/exampleSite/content/examples/blowfish-template/_index.pt-pt.md
themes/blowfish/exampleSite/content/guides/template/index.de.md
themes/blowfish/exampleSite/content/examples/blowfish-template/_index.md
themes/blowfish/exampleSite/content/users/90-7c98d8b7ba531e032abcd675d4f49c17/index.pt-br.md
themes/blowfish/exampleSite/content/guides/template/index.es.md
themes/blowfish/exampleSite/content/examples/blowfish-template/_index.it.md
themes/blowfish/exampleSite/content/users/90-7c98d8b7ba531e032abcd675d4f49c17/index.md
themes/blowfish/exampleSite/content/guides/template/index.ja.md
themes/blowfish/exampleSite/content/users/90-7c98d8b7ba531e032abcd675d4f49c17/index.de.md
themes/blowfish/exampleSite/content/guides/template/index.it.md
themes/blowfish/exampleSite/content/users/90-7c98d8b7ba531e032abcd675d4f49c17/index.es.md
themes/blowfish/exampleSite/content/guides/template/index.fr.md
themes/blowfish/exampleSite/content/users/90-7c98d8b7ba531e032abcd675d4f49c17/index.ja.md
themes/blowfish/exampleSite/content/guides/template/index.pt-pt.md
themes/blowfish/exampleSite/content/users/90-7c98d8b7ba531e032abcd675d4f49c17/index.it.md
themes/blowfish/exampleSite/content/examples/_index.es.md
themes/blowfish/exampleSite/content/guides/template/index.zh-cn.md
themes/blowfish/exampleSite/content/users/90-7c98d8b7ba531e032abcd675d4f49c17/index.fr.md
themes/blowfish/exampleSite/content/users/90-7c98d8b7ba531e032abcd675d4f49c17/index.pt-pt.md
themes/blowfish/exampleSite/content/users/90-7c98d8b7ba531e032abcd675d4f49c17/feature.webp
themes/blowfish/exampleSite/content/users/90-7c98d8b7ba531e032abcd675d4f49c17/index.zh-cn.md
themes/blowfish/exampleSite/content/guides/_index.de.md
themes/blowfish/exampleSite/content/guides/_index.es.md
themes/blowfish/exampleSite/content/users/5-5bf94b5c1e0c4a40d81816df85e1444f/index.fr.md
themes/blowfish/exampleSite/content/users/5-5bf94b5c1e0c4a40d81816df85e1444f/index.pt-pt.md
themes/blowfish/exampleSite/content/users/5-5bf94b5c1e0c4a40d81816df85e1444f/feature.webp
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/index.es.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/index.ja.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/index.it.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/index.fr.md
themes/blowfish/exampleSite/content/users/5-5bf94b5c1e0c4a40d81816df85e1444f/index.zh-cn.md
themes/blowfish/exampleSite/content/users/5-5bf94b5c1e0c4a40d81816df85e1444f/index.pt-br.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/index.pt-pt.md
themes/blowfish/exampleSite/content/users/5-5bf94b5c1e0c4a40d81816df85e1444f/index.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/index.zh-cn.md
themes/blowfish/exampleSite/content/users/5-5bf94b5c1e0c4a40d81816df85e1444f/index.de.md
themes/blowfish/exampleSite/content/users/5-5bf94b5c1e0c4a40d81816df85e1444f/index.es.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/featured.jpg
themes/blowfish/exampleSite/content/users/5-5bf94b5c1e0c4a40d81816df85e1444f/index.ja.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/index.md
themes/blowfish/exampleSite/content/users/5-5bf94b5c1e0c4a40d81816df85e1444f/index.it.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/background.jpg
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/index.de.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/article.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/01.png
themes/blowfish/exampleSite/content/authors/nunocoracao/_index.pt-br.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/blowfishnoarticles.png
themes/blowfish/exampleSite/content/authors/nunocoracao/_index.fr.md
themes/blowfish/exampleSite/content/authors/nunocoracao/_index.ja.md
themes/blowfish/exampleSite/content/authors/nunocoracao/_index.zh-cn.md
themes/blowfish/exampleSite/content/authors/nunocoracao/_index.de.md
themes/blowfish/exampleSite/content/authors/nunocoracao/_index.md
themes/blowfish/exampleSite/content/authors/nunocoracao/_index.es.md
themes/blowfish/exampleSite/content/authors/nunocoracao/_index.it.md
themes/blowfish/exampleSite/content/authors/nunocoracao/_index.pt-pt.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/ghcreate.png
themes/blowfish/exampleSite/content/examples/repo-blowfish-lite/_index.it.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/tag.png.png
themes/blowfish/exampleSite/content/examples/blowfish-tutorial/_index.pt-br.md
themes/blowfish/exampleSite/content/examples/blowfish-tutorial/_index.es.md
themes/blowfish/exampleSite/content/examples/blowfish-tutorial/_index.fr.md
themes/blowfish/exampleSite/content/examples/blowfish-tutorial/_index.pt-pt.md
themes/blowfish/exampleSite/content/examples/blowfish-tutorial/_index.md
themes/blowfish/exampleSite/content/examples/blowfish-tutorial/_index.ja.md
themes/blowfish/exampleSite/content/examples/blowfish-tutorial/_index.it.md
themes/blowfish/exampleSite/content/docs/homepage-layout/index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-tutorial/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/_index.de.md
themes/blowfish/exampleSite/content/docs/_index.es.md
themes/blowfish/exampleSite/content/examples/blowfish-tutorial/_index.de.md
themes/blowfish/exampleSite/content/docs/_index.pt-pt.md
themes/blowfish/exampleSite/content/examples/blowfish-tutorial/featured.jpg
themes/blowfish/exampleSite/content/users/85-6057b72b4986ae88640d46262a4be0a0/index.pt-br.md
themes/blowfish/exampleSite/content/docs/homepage-layout/img/home-hero.png
themes/blowfish/exampleSite/content/users/85-6057b72b4986ae88640d46262a4be0a0/index.md
themes/blowfish/exampleSite/content/docs/homepage-layout/index.de.md
themes/blowfish/exampleSite/content/docs/homepage-layout/background.svg
themes/blowfish/exampleSite/content/docs/homepage-layout/index.es.md
themes/blowfish/exampleSite/content/docs/homepage-layout/index.ja.md
themes/blowfish/exampleSite/content/docs/homepage-layout/index.it.md
themes/blowfish/exampleSite/content/docs/homepage-layout/index.fr.md
themes/blowfish/exampleSite/content/docs/homepage-layout/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/homepage-layout/img/home-list.png
themes/blowfish/exampleSite/content/docs/homepage-layout/img/home-background.png
themes/blowfish/exampleSite/content/docs/homepage-layout/index.md
themes/blowfish/exampleSite/content/docs/homepage-layout/img/home-profile.png
themes/blowfish/exampleSite/content/docs/homepage-layout/img/home-card.png
themes/blowfish/exampleSite/content/users/85-6057b72b4986ae88640d46262a4be0a0/index.de.md
themes/blowfish/exampleSite/content/users/85-6057b72b4986ae88640d46262a4be0a0/index.es.md
themes/blowfish/exampleSite/content/users/85-6057b72b4986ae88640d46262a4be0a0/index.ja.md
themes/blowfish/exampleSite/content/users/85-6057b72b4986ae88640d46262a4be0a0/index.it.md
themes/blowfish/exampleSite/content/users/85-6057b72b4986ae88640d46262a4be0a0/index.fr.md
themes/blowfish/exampleSite/content/users/85-6057b72b4986ae88640d46262a4be0a0/index.pt-pt.md
themes/blowfish/exampleSite/content/users/85-6057b72b4986ae88640d46262a4be0a0/feature.webp
themes/blowfish/exampleSite/content/users/85-6057b72b4986ae88640d46262a4be0a0/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/homepage-layout/img/home-page.png
themes/blowfish/exampleSite/content/users/29-c7116358255c4f5ccb306f7012306e22/index.zh-cn.md
themes/blowfish/exampleSite/content/users/_index.fr.md
themes/blowfish/exampleSite/content/users/29-c7116358255c4f5ccb306f7012306e22/feature.webp
themes/blowfish/exampleSite/content/examples/repo-blowfish-lite/_index.pt-br.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lite/_index.fr.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lite/_index.ja.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lite/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lite/_index.de.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lite/featured.jpg
themes/blowfish/exampleSite/content/examples/repo-blowfish-lite/_index.es.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lite/_index.pt-pt.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lite/_index.md
themes/blowfish/exampleSite/content/examples/blowfish-artist/_index.pt-br.md
themes/blowfish/exampleSite/content/examples/blowfish-artist/_index.fr.md
themes/blowfish/exampleSite/content/examples/blowfish-artist/_index.ja.md
themes/blowfish/exampleSite/content/examples/blowfish-artist/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-artist/_index.de.md
themes/blowfish/exampleSite/content/examples/blowfish-artist/featured.jpg
themes/blowfish/exampleSite/content/examples/blowfish-artist/_index.es.md
themes/blowfish/exampleSite/content/examples/blowfish-artist/_index.pt-pt.md
themes/blowfish/exampleSite/content/examples/blowfish-artist/_index.md
themes/blowfish/exampleSite/content/examples/blowfish-artist/_index.it.md
themes/blowfish/exampleSite/content/users/29-c7116358255c4f5ccb306f7012306e22/index.ja.md
themes/blowfish/exampleSite/content/users/29-c7116358255c4f5ccb306f7012306e22/index.it.md
themes/blowfish/exampleSite/content/users/29-c7116358255c4f5ccb306f7012306e22/index.fr.md
themes/blowfish/exampleSite/content/users/29-c7116358255c4f5ccb306f7012306e22/index.pt-pt.md
themes/blowfish/exampleSite/content/users/29-c7116358255c4f5ccb306f7012306e22/index.de.md
themes/blowfish/exampleSite/content/users/29-c7116358255c4f5ccb306f7012306e22/index.es.md
themes/blowfish/exampleSite/content/users/29-c7116358255c4f5ccb306f7012306e22/index.md
themes/blowfish/exampleSite/content/users/29-c7116358255c4f5ccb306f7012306e22/index.pt-br.md
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/ghcreate.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/blowfishempty.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/firebaseoptions.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/search.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/firebasecli.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/firebaseoptions.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/githubactions.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/githubactions.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/article.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/search.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/firebasecli.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/blowfishnoarticles.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/blowfishrecent.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/background.jpg
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/01.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/blowfishempty.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/profile.jpg
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/blowfishrecent.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/firebaseconsole.png.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/firebaseconsole.png
themes/blowfish/exampleSite/content/guides/202310-blowfish-tutorial/img/tag.png
themes/blowfish/exampleSite/content/authors/secondauthor/_index.pt-br.md
themes/blowfish/exampleSite/content/authors/secondauthor/_index.fr.md
themes/blowfish/exampleSite/content/authors/secondauthor/_index.ja.md
themes/blowfish/exampleSite/content/authors/secondauthor/_index.zh-cn.md
themes/blowfish/exampleSite/content/authors/secondauthor/_index.de.md
themes/blowfish/exampleSite/content/authors/secondauthor/_index.es.md
themes/blowfish/exampleSite/content/authors/secondauthor/_index.pt-pt.md
themes/blowfish/exampleSite/content/authors/secondauthor/_index.md
themes/blowfish/exampleSite/content/authors/secondauthor/_index.it.md
themes/blowfish/exampleSite/content/authors/_index.md
themes/blowfish/exampleSite/content/authors/_index.it.md
themes/blowfish/exampleSite/content/users/19-fd12be5b9c01f6b6089b8b1cbff1350d/index.pt-br.md
themes/blowfish/exampleSite/content/users/19-fd12be5b9c01f6b6089b8b1cbff1350d/index.md
themes/blowfish/exampleSite/content/users/19-fd12be5b9c01f6b6089b8b1cbff1350d/index.de.md
themes/blowfish/exampleSite/content/users/19-fd12be5b9c01f6b6089b8b1cbff1350d/index.es.md
themes/blowfish/exampleSite/content/users/19-fd12be5b9c01f6b6089b8b1cbff1350d/index.ja.md
themes/blowfish/exampleSite/content/users/19-fd12be5b9c01f6b6089b8b1cbff1350d/index.it.md
themes/blowfish/exampleSite/content/examples/blowfish-lite/_index.es.md
themes/blowfish/exampleSite/content/users/19-fd12be5b9c01f6b6089b8b1cbff1350d/index.fr.md
themes/blowfish/exampleSite/content/examples/blowfish-lite/_index.pt-pt.md
themes/blowfish/exampleSite/content/users/19-fd12be5b9c01f6b6089b8b1cbff1350d/index.pt-pt.md
themes/blowfish/exampleSite/content/examples/blowfish-lite/_index.md
themes/blowfish/exampleSite/content/examples/blowfish-lite/_index.it.md
themes/blowfish/exampleSite/content/users/19-fd12be5b9c01f6b6089b8b1cbff1350d/feature.webp
themes/blowfish/exampleSite/content/users/19-fd12be5b9c01f6b6089b8b1cbff1350d/index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-lite/_index.pt-br.md
themes/blowfish/exampleSite/content/examples/blowfish-lite/_index.fr.md
themes/blowfish/exampleSite/content/examples/blowfish-lite/_index.ja.md
themes/blowfish/exampleSite/content/examples/blowfish-lite/_index.zh-cn.md
themes/blowfish/exampleSite/content/examples/blowfish-lite/_index.de.md
themes/blowfish/exampleSite/content/examples/blowfish-lite/featured.jpg
themes/blowfish/exampleSite/content/users/95-c3df142090b1a28ef311312eb82f1e51/feature.webp
themes/blowfish/exampleSite/content/users/95-c3df142090b1a28ef311312eb82f1e51/index.zh-cn.md
themes/blowfish/exampleSite/content/users/95-c3df142090b1a28ef311312eb82f1e51/index.pt-pt.md
themes/blowfish/exampleSite/content/users/95-c3df142090b1a28ef311312eb82f1e51/index.fr.md
themes/blowfish/exampleSite/content/users/100-f430dff82b8fbb8334091953bfe58598/index.pt-pt.md
themes/blowfish/exampleSite/content/users/100-f430dff82b8fbb8334091953bfe58598/feature.webp
themes/blowfish/exampleSite/content/users/100-f430dff82b8fbb8334091953bfe58598/index.zh-cn.md
themes/blowfish/exampleSite/content/users/100-f430dff82b8fbb8334091953bfe58598/index.it.md
themes/blowfish/exampleSite/content/users/100-f430dff82b8fbb8334091953bfe58598/index.fr.md
themes/blowfish/exampleSite/content/users/100-f430dff82b8fbb8334091953bfe58598/index.ja.md
themes/blowfish/exampleSite/content/users/95-c3df142090b1a28ef311312eb82f1e51/index.it.md
themes/blowfish/exampleSite/content/users/100-f430dff82b8fbb8334091953bfe58598/index.es.md
themes/blowfish/exampleSite/content/users/24-80d4420e686d5a055bab647fa03d281b/index.it.md
themes/blowfish/exampleSite/content/users/24-80d4420e686d5a055bab647fa03d281b/index.fr.md
themes/blowfish/exampleSite/content/users/24-80d4420e686d5a055bab647fa03d281b/index.pt-pt.md
themes/blowfish/exampleSite/content/users/24-80d4420e686d5a055bab647fa03d281b/feature.webp
themes/blowfish/exampleSite/content/users/24-80d4420e686d5a055bab647fa03d281b/index.zh-cn.md
themes/blowfish/exampleSite/content/users/24-80d4420e686d5a055bab647fa03d281b/index.es.md
themes/blowfish/exampleSite/content/users/24-80d4420e686d5a055bab647fa03d281b/index.ja.md
themes/blowfish/exampleSite/content/users/24-80d4420e686d5a055bab647fa03d281b/index.de.md
themes/blowfish/exampleSite/content/users/24-80d4420e686d5a055bab647fa03d281b/index.md
themes/blowfish/exampleSite/content/users/95-c3df142090b1a28ef311312eb82f1e51/index.ja.md
themes/blowfish/exampleSite/content/users/24-80d4420e686d5a055bab647fa03d281b/index.pt-br.md
themes/blowfish/exampleSite/content/docs/welcome/featured.svg
themes/blowfish/exampleSite/content/docs/welcome/index.pt-br.md
themes/blowfish/exampleSite/content/docs/welcome/old.svg
themes/blowfish/exampleSite/content/docs/welcome/image-resizing.png
themes/blowfish/exampleSite/content/docs/welcome/index.md
themes/blowfish/exampleSite/content/users/95-c3df142090b1a28ef311312eb82f1e51/index.pt-br.md
themes/blowfish/exampleSite/content/docs/welcome/lighthouse.jpg
themes/blowfish/exampleSite/content/users/95-c3df142090b1a28ef311312eb82f1e51/index.md
themes/blowfish/exampleSite/content/docs/welcome/index.de.md
themes/blowfish/exampleSite/content/users/95-c3df142090b1a28ef311312eb82f1e51/index.de.md
themes/blowfish/exampleSite/content/docs/welcome/background.svg
themes/blowfish/exampleSite/content/users/95-c3df142090b1a28ef311312eb82f1e51/index.es.md
themes/blowfish/exampleSite/content/docs/welcome/index.es.md
themes/blowfish/exampleSite/content/docs/welcome/index.ja.md
themes/blowfish/exampleSite/content/docs/welcome/index.it.md
themes/blowfish/exampleSite/content/docs/welcome/index.fr.md
themes/blowfish/exampleSite/content/docs/welcome/index.pt-pt.md
themes/blowfish/exampleSite/content/users/100-f430dff82b8fbb8334091953bfe58598/index.de.md
themes/blowfish/exampleSite/content/docs/welcome/index.zh-cn.md
themes/blowfish/exampleSite/content/users/100-f430dff82b8fbb8334091953bfe58598/index.md
themes/blowfish/exampleSite/content/docs/_index.md
themes/blowfish/exampleSite/content/users/100-f430dff82b8fbb8334091953bfe58598/index.pt-br.md
themes/blowfish/exampleSite/content/users/103-43b666016e50920826ef05ae95486724/index.pt-br.md
themes/blowfish/exampleSite/content/users/103-43b666016e50920826ef05ae95486724/index.md
themes/blowfish/exampleSite/content/users/103-43b666016e50920826ef05ae95486724/index.de.md
themes/blowfish/exampleSite/content/users/103-43b666016e50920826ef05ae95486724/index.es.md
themes/blowfish/exampleSite/content/users/103-43b666016e50920826ef05ae95486724/index.ja.md
themes/blowfish/exampleSite/content/users/103-43b666016e50920826ef05ae95486724/index.it.md
themes/blowfish/exampleSite/content/users/103-43b666016e50920826ef05ae95486724/index.fr.md
themes/blowfish/exampleSite/content/users/103-43b666016e50920826ef05ae95486724/index.pt-pt.md
themes/blowfish/exampleSite/content/users/103-43b666016e50920826ef05ae95486724/feature.webp
themes/blowfish/exampleSite/content/users/103-43b666016e50920826ef05ae95486724/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/thumbnails/index.it.md
themes/blowfish/exampleSite/content/docs/thumbnails/index.fr.md
themes/blowfish/exampleSite/content/docs/thumbnails/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/thumbnails/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/thumbnails/index.es.md
themes/blowfish/exampleSite/content/docs/thumbnails/index.ja.md
themes/blowfish/exampleSite/content/docs/thumbnails/background.svg
themes/blowfish/exampleSite/content/docs/thumbnails/index.de.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lowkey/_index.es.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lowkey/_index.pt-pt.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lowkey/_index.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lowkey/_index.it.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lowkey/_index.de.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lowkey/featured.jpg
themes/blowfish/exampleSite/content/docs/thumbnails/index.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lowkey/_index.zh-cn.md
themes/blowfish/exampleSite/content/users/7-25036bf87aa99ef82e09089a1ddbb9eb/index.pt-br.md
themes/blowfish/exampleSite/content/users/7-25036bf87aa99ef82e09089a1ddbb9eb/index.md
themes/blowfish/exampleSite/content/users/7-25036bf87aa99ef82e09089a1ddbb9eb/index.de.md
themes/blowfish/exampleSite/content/users/7-25036bf87aa99ef82e09089a1ddbb9eb/index.es.md
themes/blowfish/exampleSite/content/users/7-25036bf87aa99ef82e09089a1ddbb9eb/index.ja.md
themes/blowfish/exampleSite/content/users/7-25036bf87aa99ef82e09089a1ddbb9eb/index.it.md
themes/blowfish/exampleSite/content/users/7-25036bf87aa99ef82e09089a1ddbb9eb/index.fr.md
themes/blowfish/exampleSite/content/users/7-25036bf87aa99ef82e09089a1ddbb9eb/index.pt-pt.md
themes/blowfish/exampleSite/content/users/7-25036bf87aa99ef82e09089a1ddbb9eb/feature.webp
themes/blowfish/exampleSite/content/users/7-25036bf87aa99ef82e09089a1ddbb9eb/index.zh-cn.md
themes/blowfish/exampleSite/content/users/40-1b3c507d9cd618565898e6d099c0427d/index.it.md
themes/blowfish/exampleSite/content/users/40-1b3c507d9cd618565898e6d099c0427d/index.fr.md
themes/blowfish/exampleSite/content/users/40-1b3c507d9cd618565898e6d099c0427d/index.pt-pt.md
themes/blowfish/exampleSite/content/users/40-1b3c507d9cd618565898e6d099c0427d/feature.webp
themes/blowfish/exampleSite/content/users/40-1b3c507d9cd618565898e6d099c0427d/index.zh-cn.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lowkey/_index.pt-br.md
themes/blowfish/exampleSite/content/docs/thumbnails/featured.svg
themes/blowfish/exampleSite/content/users/40-1b3c507d9cd618565898e6d099c0427d/index.de.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lowkey/_index.fr.md
themes/blowfish/exampleSite/content/docs/thumbnails/index.pt-br.md
themes/blowfish/exampleSite/content/examples/repo-blowfish-lowkey/_index.ja.md
themes/blowfish/exampleSite/content/users/40-1b3c507d9cd618565898e6d099c0427d/index.es.md
themes/blowfish/exampleSite/content/users/40-1b3c507d9cd618565898e6d099c0427d/index.ja.md
themes/blowfish/exampleSite/content/users/40-1b3c507d9cd618565898e6d099c0427d/index.md
themes/blowfish/exampleSite/content/users/40-1b3c507d9cd618565898e6d099c0427d/index.pt-br.md
themes/blowfish/exampleSite/content/docs/partials/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/installation/index.fr.md
themes/blowfish/exampleSite/content/docs/partials/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/installation/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/installation/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/_index.it.md
themes/blowfish/exampleSite/content/docs/installation/index.ja.md
themes/blowfish/exampleSite/content/docs/installation/index.it.md
themes/blowfish/exampleSite/content/docs/installation/index.es.md
themes/blowfish/exampleSite/content/docs/installation/background.svg
themes/blowfish/exampleSite/content/docs/partials/index.fr.md
themes/blowfish/exampleSite/content/docs/content-examples/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/installation/index.de.md
themes/blowfish/exampleSite/content/docs/shortcodes/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/getting-started/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/partials/index.it.md
themes/blowfish/exampleSite/content/docs/shortcodes/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/getting-started/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/installation/index.md
themes/blowfish/exampleSite/content/docs/content-examples/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/partials/index.ja.md
themes/blowfish/exampleSite/content/docs/shortcodes/index.fr.md
themes/blowfish/exampleSite/content/docs/getting-started/index.fr.md
themes/blowfish/exampleSite/content/docs/content-examples/index.fr.md
themes/blowfish/exampleSite/content/docs/installation/old.svg
themes/blowfish/exampleSite/content/docs/shortcodes/index.it.md
themes/blowfish/exampleSite/content/docs/partials/index.es.md
themes/blowfish/exampleSite/content/docs/getting-started/index.it.md
themes/blowfish/exampleSite/content/docs/content-examples/index.it.md
themes/blowfish/exampleSite/content/docs/installation/featured.svg
themes/blowfish/exampleSite/content/docs/installation/index.pt-br.md
themes/blowfish/exampleSite/content/docs/content-examples/index.es.md
themes/blowfish/exampleSite/content/docs/content-examples/index.ja.md
themes/blowfish/exampleSite/content/docs/partials/index.de.md
themes/blowfish/exampleSite/content/docs/partials/background.svg
themes/blowfish/exampleSite/content/docs/partials/index.md
themes/blowfish/exampleSite/content/docs/content-examples/background.svg
themes/blowfish/exampleSite/content/docs/partials/index.pt-br.md
themes/blowfish/exampleSite/content/docs/content-examples/index.de.md
themes/blowfish/exampleSite/content/docs/configuration/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/getting-started/index.es.md
themes/blowfish/exampleSite/content/docs/getting-started/index.ja.md
themes/blowfish/exampleSite/content/docs/configuration/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/getting-started/index.de.md
themes/blowfish/exampleSite/content/docs/getting-started/background.svg
themes/blowfish/exampleSite/content/docs/getting-started/index.md
themes/blowfish/exampleSite/content/docs/shortcodes/index.ja.md
themes/blowfish/exampleSite/content/docs/shortcodes/index.es.md
themes/blowfish/exampleSite/content/docs/content-examples/index.md
themes/blowfish/exampleSite/content/docs/partials/featured.svg
themes/blowfish/exampleSite/content/docs/configuration/index.fr.md
themes/blowfish/exampleSite/content/docs/configuration/index.it.md
themes/blowfish/exampleSite/content/docs/configuration/index.ja.md
themes/blowfish/exampleSite/content/docs/getting-started/index.pt-br.md
themes/blowfish/exampleSite/content/docs/getting-started/old.svg
themes/blowfish/exampleSite/content/docs/getting-started/featured.svg
themes/blowfish/exampleSite/content/docs/content-examples/index.pt-br.md
themes/blowfish/exampleSite/content/docs/content-examples/featured.svg
themes/blowfish/exampleSite/content/docs/shortcodes/abstract.jpg
themes/blowfish/exampleSite/content/docs/shortcodes/index.md
themes/blowfish/exampleSite/content/docs/shortcodes/index.de.md
themes/blowfish/exampleSite/content/docs/shortcodes/index.pt-br.md
themes/blowfish/exampleSite/content/docs/shortcodes/background.svg
themes/blowfish/exampleSite/content/docs/shortcodes/old.svg
themes/blowfish/exampleSite/content/docs/configuration/index.es.md
themes/blowfish/exampleSite/content/docs/shortcodes/featured.svg
themes/blowfish/exampleSite/content/docs/configuration/background.svg
themes/blowfish/exampleSite/content/docs/configuration/index.de.md
themes/blowfish/exampleSite/content/docs/configuration/featured.svg
themes/blowfish/exampleSite/content/docs/configuration/index.pt-br.md
themes/blowfish/exampleSite/content/docs/configuration/old.svg
themes/blowfish/exampleSite/content/docs/configuration/index.md
themes/blowfish/exampleSite/content/docs/hosting-deployment/index.zh-cn.md
themes/blowfish/exampleSite/content/docs/hosting-deployment/netlify-build-settings.jpg
themes/blowfish/exampleSite/content/docs/shortcodes/gallery/04.jpg
themes/blowfish/exampleSite/content/docs/shortcodes/gallery/02.jpg
themes/blowfish/exampleSite/content/docs/shortcodes/gallery/05.jpg
themes/blowfish/exampleSite/content/docs/shortcodes/gallery/03.jpg
themes/blowfish/exampleSite/content/docs/shortcodes/gallery/07.jpg
themes/blowfish/exampleSite/content/docs/shortcodes/gallery/06.jpg
themes/blowfish/exampleSite/content/docs/shortcodes/gallery/01.jpg
themes/blowfish/exampleSite/content/docs/hosting-deployment/background.svg
themes/blowfish/exampleSite/content/docs/hosting-deployment/index.es.md
themes/blowfish/exampleSite/content/docs/hosting-deployment/index.ja.md
themes/blowfish/exampleSite/content/docs/hosting-deployment/index.it.md
themes/blowfish/exampleSite/content/docs/hosting-deployment/index.fr.md
themes/blowfish/exampleSite/content/docs/hosting-deployment/index.pt-pt.md
themes/blowfish/exampleSite/content/docs/hosting-deployment/github-pages-source.jpg
themes/blowfish/exampleSite/content/docs/hosting-deployment/index.md
themes/blowfish/exampleSite/content/docs/hosting-deployment/index.de.md
themes/blowfish/exampleSite/content/docs/hosting-deployment/featured.svg
themes/blowfish/exampleSite/content/docs/hosting-deployment/index.pt-br.md
themes/blowfish/exampleSite/content/docs/hosting-deployment/render-settings.jpg
themes/blowfish/exampleSite/content/users/55-a322d57671bf49fe0f2539096f9ed57f/index.zh-cn.md
themes/blowfish/exampleSite/content/users/55-a322d57671bf49fe0f2539096f9ed57f/feature.webp
themes/blowfish/exampleSite/content/users/55-a322d57671bf49fe0f2539096f9ed57f/index.pt-pt.md
themes/blowfish/exampleSite/content/users/55-a322d57671bf49fe0f2539096f9ed57f/index.pt-br.md
themes/blowfish/exampleSite/content/users/55-a322d57671bf49fe0f2539096f9ed57f/index.md
themes/blowfish/exampleSite/content/users/55-a322d57671bf49fe0f2539096f9ed57f/index.de.md
themes/blowfish/exampleSite/content/users/55-a322d57671bf49fe0f2539096f9ed57f/index.es.md
themes/blowfish/exampleSite/content/users/55-a322d57671bf49fe0f2539096f9ed57f/index.ja.md
themes/blowfish/exampleSite/content/users/55-a322d57671bf49fe0f2539096f9ed57f/index.it.md
themes/blowfish/exampleSite/content/users/55-a322d57671bf49fe0f2539096f9ed57f/index.fr.md

exec
/bin/zsh -lc 'rg -n "pytest|PAN-OS|PA-440|drift|Policy-as-Code|policy as code|firewall" .' in /home/mareox/GIT/homelab-journal
 succeeded in 140ms:
codex
I found the draft at `content/posts/2026/pytest-panos-firewall-testing/index.md`. The existing piece already has strong technical proof; the enterprise reframe needs a sharper risk narrative, fleet/Panorama posture, and compliance evidence angle.
exec
/bin/zsh -lc "sed -n '1,180p' content/posts/2026/pytest-panos-firewall-testing/index.md" in /home/mareox/GIT/homelab-journal
 succeeded in 0ms:
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

exec
/bin/zsh -lc "sed -n '180,430p' content/posts/2026/pytest-panos-firewall-testing/index.md" in /home/mareox/GIT/homelab-journal
 succeeded in 0ms:
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

codex
The strongest enterprise framing is:

**Firewall policy drift is a governance problem, not a firewall problem.**

A CISO does not lose sleep over whether one PA-440 has a weird rule. They lose sleep over this:

> “We have 200 firewalls, multiple teams making changes, quarterly audits, cyber insurance attestations, PCI/SOC2 evidence requests, and no reliable way to prove every firewall still enforces our minimum security standard today.”

So the post should stop sounding like “I tested my firewall” and start sounding like:

> “I turned firewall security requirements into executable controls.”

That is the enterprise-grade angle.

**1. Strongest LinkedIn Framing**

Lead with the anxiety of control drift:

> Most companies can tell you whether their firewalls are online. Far fewer can prove every allow rule has inspection, logging, ownership, and an expiration policy.

That hits senior SEs, security architects, and CISOs because it maps directly to audit failure, breach investigation pain, and operational sprawl.

The best framing:

**Policy-as-Code for PAN-OS: codify minimum firewall standards once, run them continuously across the fleet, and fail CI when reality drifts from intent.**

Make it about:

- Continuous control validation
- Fleet-wide evidence
- Drift detection before incident/audit
- Security exceptions as explicit code
- Panorama-managed enterprise scale
- CI/CD quality gates for network security

Avoid making pytest the main character. pytest is the boring mechanism. The story is executable security governance.

**2. Article Restructure**

Current title is clever, but still homelab-coded. Stronger title options:

- **Policy-as-Code for PAN-OS: Testing Firewall Security Controls with pytest**
- **Turning PAN-OS Firewall Standards into Executable Tests**
- **Your Firewall Config Is Production Code. Test It Like Production Code.**
- **Continuous Firewall Compliance for PAN-OS with pytest and CI**

Suggested structure:

1. **The Problem: Firewall Drift Becomes Security Debt**
   Open with enterprise scale: many firewalls, many admins, temporary rules, emergency changes, inconsistent device groups, audit pressure.

2. **The Principle: Security Requirements Should Be Executable**
   “Every allow rule must log. Internet-facing rules must have inspection. Untrust zones must have zone protection. Temporary rules must expire.”

3. **The Control Catalog**
   Add a table:

   | Requirement | pytest Control |
   |---|---|
   | All allow rules log to SIEM | `test_allow_rules_have_log_forwarding` |
   | Allow rules have security profiles | `test_allow_rules_have_security_profile_group` |
   | No unrestricted internet allow | `test_no_unrestricted_allow_from_internet` |
   | Zone protection applied | `test_zone_protection_profile_applied` |
   | Temporary rules expire | `test_temporary_rules_have_expiration` |
   | Rule ownership documented | `test_rules_have_owner_tag` |

4. **Implementation: Read-Only PAN-OS API + pytest**
   Keep your existing code, but frame it as a minimal control engine.

5. **Enterprise Scale: Panorama and Device Groups**
   Expand this section significantly. Include branch firewalls, data center firewalls, cloud VM-Series, managed firewalls by serial, device groups, templates, and pre/post rules.

6. **CI/CD Workflow**
   Show three modes:
   - Nightly compliance sweep
   - Post-config-backup drift detection
   - Pre-change validation against candidate config

7. **Audit Evidence**
   This is missing and important. Show that pytest output becomes evidence: timestamped, versioned, attached to CI run, mapped to control IDs.

8. **Exception Handling**
   Enterprise credibility requires exceptions. Add an allowlist or YAML file with `reason`, `owner`, `expires`, and `ticket`.

   Example:

   ```yaml
   exceptions:
     - rule: ALLOW-Vendor-Temporary
       control: require-security-profile
       owner: network-security
       ticket: CHG-12345
       expires: 2026-06-30
       reason: Vendor migration window
   ```

9. **What This Does Not Replace**
   Say it clearly: this does not replace Panorama, Strata Cloud Manager, SIEM, vuln management, or formal firewall review. It gives you executable assertions over the controls your org says matter.

10. **Takeaways**
   Reframe around enterprise outcomes:
   - Drift becomes visible.
   - Exceptions become deliberate.
   - Audit evidence becomes automatic.
   - Minimum standards become enforceable.
   - Firewall review moves from spreadsheet to CI.

**3. Best One-Line LinkedIn Hook**

My strongest pick:

> Your firewall may be healthy, but can you prove every allow rule is inspected, logged, owned, and still required?

Other strong options:

> Monitoring tells you your firewall is up. Policy-as-Code tells you whether it is still enforcing your security standard.

> If your firewall standards live in a PDF, they are suggestions. If they live in pytest, they can fail a pipeline.

> I used pytest to turn PAN-OS firewall requirements into executable security controls.

> The scariest firewall rule is not the one that breaks production. It is the temporary allow rule everyone forgot.

For senior network security engineers, I’d use:

> Your firewall config is production code. Test it like production code.

That one is blunt, shareable, and technically legible.

**4. Enterprise Scenarios That Make This Essential**

Use these as article sections or LinkedIn bullets:

- **PCI-DSS firewall reviews:** Prove internet-facing and cardholder-data rules have logging, inspection, ownership, and documented scope.
- **SOC2 evidence:** Export CI runs showing continuous validation of network access controls.
- **M&A firewall review:** Run the same control suite against acquired PAN-OS environments to find inherited risk fast.
- **Branch firewall sprawl:** Validate hundreds of Panorama-managed branch firewalls against baseline controls.
- **Temporary vendor access:** Fail rules that lack expiration tags, ticket IDs, or restricted source/destination.
- **SIEM blind spots:** Catch allow rules that do not forward logs before incident response depends on missing telemetry.
- **Security profile gaps:** Identify allowed traffic without AV, vulnerability, URL filtering, DNS security, wildfire, or profile groups.
- **Pre-audit readiness:** Replace manual spreadsheet sampling with repeatable control evidence.
- **Change control enforcement:** Run tests after every commit, config backup, or Panorama push.
- **Zero Trust segmentation:** Validate that critical zones cannot talk broadly to each other.
- **Cloud firewall parity:** Compare VM-Series firewalls against the same baseline as physical perimeter firewalls.
- **Incident response:** After a breach, prove whether the relevant firewall controls were present at a specific point in time.

**5. What Makes a Security Architect Share It**

A security architect shares this if it gives their team a reusable pattern, not just an anecdote.

Add these:

- A “minimum viable PAN-OS control suite” table
- A Panorama fleet pattern
- A CI pipeline example
- An exception model with owners, reasons, tickets, and expiration
- A mapping from tests to compliance/control language
- Clear opinion: “Manual firewall reviews do not scale. Executable controls do.”

The share-worthy thesis:

> Stop asking engineers to remember every firewall standard during every change window. Encode the standard once, run it continuously, and make drift visible while it is still cheap to fix.

LinkedIn post shape:

```text
Most companies monitor whether their firewalls are healthy.

Fewer can answer:

- Does every allow rule forward logs to the SIEM?
- Does every internet-facing rule have inspection?
- Do temporary vendor rules expire?
- Are exceptions documented with owners and tickets?
- Do all branch firewalls match the corporate baseline?

That is not a monitoring problem.
That is a Policy-as-Code problem.

I used pytest against the PAN-OS XML API to turn firewall requirements into executable tests.

The result: a CI job that can validate live PAN-OS config, fail on drift, and produce audit evidence.

Your firewall config is production code.
Test it like production code.
```

The article should still mention the homelab PA-440, but only as the lab where the enterprise pattern was proven. The headline story should be enterprise control validation, not homelab drift.
2026-05-02T04:59:29.148916Z ERROR codex_core::session: failed to record rollout items: thread 019de70d-9173-7d90-b4a6-818ab1fdd634 not found
tokens used
58,962

```

## Concise summary

Provider completed successfully. Review the raw output for details.

## Action items

- Review the response and extract decisions you want to apply.
- Capture follow-up implementation tasks if needed.
