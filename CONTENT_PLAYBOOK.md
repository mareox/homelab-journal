# Content Playbook

Guidelines for creating high-quality, visually rich blog posts that serve both as technical documentation and LinkedIn-shareable content.

## Content Pillars

Every post should align with one or more branding pillars:

| Pillar | Theme | LinkedIn Angle |
|--------|-------|----------------|
| **AI-Augmented Infrastructure** | MCP servers, Claude Code, agentic architecture | "How I use AI as my infrastructure co-pilot" |
| **Homelab HA Engineering** | Caddy GitOps, Pi-hole HA, Proxmox monitoring | "Production-grade patterns at home scale" |
| **Security + Compliance** | PAN-OS, Wazuh XDR, ChainGuard, cert management | "Enterprise security without enterprise budget" |
| **Automation Philosophy** | Docker updates, WUD, Semaphore, Ansible | "Eliminate manual steps, eliminate drift" |

## Voice Guidelines

- **Lead with pain.** First paragraph = relatable problem the reader also has. Not "I configured X" but "Answering that question used to mean..."
- **Name decisions explicitly.** "I chose X over Y because Z." Decision transparency builds credibility.
- **Show the before/after.** Every post should make the improvement tangible.
- **End with transferable lessons.** Not "how I configured Pi-hole" but "graceful degradation beats fail-fast for infrastructure tools."
- **Write for a senior engineer scanning on mobile.** Short paragraphs. Bold key phrases. Tables over walls of text.

### Tone: Conference Talk, Not Technical Manual

Posts should feel like a smart friend telling you about something cool they built. Add personality:

- **Self-deprecating humor.** "I named my AI after a fictional nihilist. That should tell you something about my infrastructure anxiety."
- **Conversational asides.** Break formal tone with natural observations.
- **Fun analogies.** "He basically looked at a gas gauge showing full and announced we were running on fumes."
- **Real personality in incidents.** Include the human moments (telling an AI to say thank you, the drama of a false alarm at midnight).
- **Light touch.** One or two moments per section, not every paragraph. Never forced.
- **Never sacrifice accuracy.** The substance stays rigorous. Humor wraps the insight, never replaces it.

**Bad:** "The infrastructure patrol runs four times daily at the specified intervals."
**Good:** "Four times a day, rain or shine, Gilfoyle sweeps every service like a paranoid security guard checking locks."

## Visual Content Requirements

### Image Types (Priority Order)

| Type | When | Example |
|------|------|---------|
| **UI Screenshots** | Every config step, every result | Proxmox GUI, Grafana dashboard, Semaphore task output |
| **Terminal Output** | CLI commands with visible results | `hugo server` output, `curl` responses, test runs |
| **Architecture Diagrams** | System design, data flow | Hand-crafted SVGs following the design system |
| **Before/After** | Migrations, fixes, improvements | Side-by-side of old vs new dashboard/workflow |
| **Annotated Screenshots** | Complex UIs needing guidance | Red boxes, arrows, numbered callouts |
| **Code + Output Pairs** | Showing code then its result | Code block followed by screenshot of output |

### Visual Density Targets

| Post Length | Minimum Images | Ideal | Rule of Thumb |
|-------------|---------------|-------|---------------|
| Short (< 800 words) | 3 | 5 | 1 image per 150 words |
| Medium (800-1500 words) | 5 | 8 | 1 image per 200 words |
| Long (1500+ words) | 8 | 12+ | 1 image per 200 words |

Every post must have **at minimum**: a thumbnail, one architecture/flow diagram, and one screenshot proving the end result works.

### Screenshot Annotation Standards

Follow the blog's design system colors:

| Annotation | Color | Hex | Use |
|------------|-------|-----|-----|
| "Look here" boxes | Red | `#ef4444` | Highlight key fields or buttons |
| Flow arrows | Blue | `#3b82f6` | Show sequence or data flow |
| Step numbers | Green | `#22c55e` | Numbered circles for sequences |
| De-emphasis overlay | Gray | `#64748b` at 40% opacity | Dim irrelevant parts of screenshot |

**Tools:** Flameshot (Linux), CleanShot X (macOS), or SVG overlay layers.

**Screenshot rules:**
- Crop tight — no full desktop, just the relevant panel/section
- Consistent browser/terminal width across a post (800-1000px)
- Dark theme preferred (matches blog aesthetic)
- Redact sensitive data before capturing (IPs, tokens, passwords)

### SVG Diagram Design System

Existing standard from CLAUDE.md — all diagrams use:
- Background: `#0f172a` (slate-900), font: Segoe UI/system-ui
- Colors: Tailwind tokens (blue=`#3b82f6`, green=`#22c55e`, amber=`#f59e0b`, red=`#ef4444`, purple=`#a855f7`)
- Components: `linearGradient`, `feDropShadow` filter, marker arrowheads, `rx="6"/"8"` rounded rects

## Pre-Publish Quality Gate

Run through this checklist before every `git push`:

| # | Gate | Check |
|---|------|-------|
| 1 | **Hook** | First paragraph presents a relatable problem? |
| 2 | **So-what** | Clear why the reader should care? |
| 3 | **Decision transparency** | Key choices explained with alternatives considered? |
| 4 | **Visual density** | Meets minimum image count for post length? |
| 5 | **Screenshot proof** | End result shown visually (not just described)? |
| 6 | **Architecture diagram** | System design explained with SVG/diagram? |
| 7 | **Annotated steps** | Complex UI steps have annotated screenshots? |
| 8 | **Before/after** | If migration/improvement — side-by-side exists? |
| 9 | **Code + output** | Key code blocks paired with result screenshot? |
| 10 | **Lessons section** | Ends with transferable, quotable insights? |
| 11 | **Thumbnail** | Co-located `thumbnail.png` exists in page bundle? |
| 12 | **Description** | Frontmatter `description:` is ≤160 chars and compelling? |
| 13 | **Sanitized** | `node scripts/sanitize.js --validate` passes? |
| 14 | **Social hook** | One-sentence "why this matters" ready for LinkedIn? |

## Post-Publish Checklist

After the post goes live:

1. **Generate social posts** — Run `/mx-social-post` to create LinkedIn, Twitter/X, and Reddit narratives
2. **Select social image** — Pick the most impactful screenshot or diagram from the post
3. **Cross-link** — Update related wiki pages or posts to link to the new content
4. **Knowledge base** — If the post references external tools, add them to `knowledge-base`

## Content Types and Visual Expectations

| Type | Required Visuals | Optional |
|------|-----------------|----------|
| **Tutorial** | Screenshot per step, final result screenshot, prerequisites screenshot | Architecture diagram, before/after |
| **Lesson Learned** | Error screenshot, fix result screenshot | Root cause diagram, timeline |
| **Architecture** | Architecture SVG, component relationship diagram | UI screenshots of key services |
| **Lab Note** | At least 1 result screenshot | Terminal output capture |
| **Journal** | None required (quick entries) | Screenshots welcome |

## Reference Blogs

Visual quality benchmarks — study these for inspiration:

- **VirtualizationHowTo** (virtualizationhowto.com) — Screenshot-per-step approach, annotated UI captures, 10-20 images per tutorial
- **PacketSwitch** (packetswitch.co.uk) — Clean SVG icons, focused screenshots, practical network/security examples
