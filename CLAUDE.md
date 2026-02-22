# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Public Hugo blog documenting homelab journey. Companion to `homelab-infra` (private) - this repo contains **sanitized, public-friendly content only**.

**Live site:** https://mareox.github.io/homelab-journal/

## Commands

```bash
# Local development (includes drafts)
hugo server -D

# Create new content (uses archetypes)
hugo new journal/2026-01-29-topic.md   # Changelog-style work log
hugo new tutorials/my-tutorial.md       # Step-by-step guide
hugo new posts/2026/my-post.md          # Lesson learned or lab note
hugo new wiki/networking/topic.md       # Evergreen reference

# Production build
hugo --minify
```

## Content Architecture

**Hybrid wiki/blog/journal structure:**

| Section | Purpose | Path | When to Use |
|---------|---------|------|-------------|
| **Journal** | Chronological work log | `content/journal/` | Quick "what/when/why" entries |
| Wiki | Evergreen reference by topic | `content/wiki/{topic}/` | Documentation that gets updated over time |
| Tutorials | Step-by-step how-tos | `content/tutorials/` | Detailed guides with prerequisites |
| Posts | Lessons learned, lab notes | `content/posts/{year}/` | Deep dives, post-mortems |
| Series | Multi-part learning paths | `content/series/` | Related tutorials that build on each other |

**Journal vs Posts:** Journal entries are brief changelog-style notes ("did X because Y"). Posts are longer-form content with full context and lessons learned. Journal entries can link to detailed posts via `related:` frontmatter.

**Taxonomies:**
- `tags` - Content type (tutorial, lesson-learned, lab-note, journal)
- `topics` - Technology (proxmox, docker, networking, dns)
- `difficulties` - beginner, intermediate, advanced

## Archetypes

Use `hugo new` to create content from templates in `archetypes/`:
- `journal.md` - Quick work log entry with what/why/details/result sections
- `tutorial.md` - Step-by-step guide with prerequisites, verification, troubleshooting
- `lesson-learned.md` - Post-mortem style with problem, solution, root cause
- `architecture.md` - System design with SVG diagrams
- `wiki.md` - Reference documentation

## Internal Links

Use Hugo's `relref` shortcode for internal links (required for correct base path handling):

```markdown
[Networking]({{< relref "/wiki/networking" >}})
[Related Post]({{< relref "/posts/2026/my-post" >}})
```

**Do NOT use** bare paths like `/wiki/networking/` - they break due to the `/homelab-journal/` base URL.

## Diagrams

All diagrams are **hand-crafted SVGs** co-located as page resources (not Mermaid). Design system:
- Background: `#0f172a` (slate-900), font: Segoe UI/system-ui
- Colors: Tailwind tokens (blue=#3b82f6, green=#22c55e, amber=#f59e0b, red=#ef4444, purple=#a855f7)
- Components: linearGradient, feDropShadow filter, marker arrowheads, rx="6"/"8" rounded rects

Usage in markdown: `![Alt text](diagram-name.svg)`

## Security: Content Sanitization

**This is a PUBLIC repository.** All content must be sanitized:

| Real Value | Use Instead |
|------------|-------------|
| `192.168.x.x`, `10.x.x.x` | `<YOUR_IP>` or role name |
| Actual hostnames | Role names: `DNS-Primary`, `Proxmox-Node-1` |
| Domains | `<YOUR_DOMAIN>` or `example.com` |
| Credentials | `<YOUR_PASSWORD>`, `<YOUR_API_KEY>` |

**Hostname mapping reference:**
- dns1, dns2 → DNS-Primary, DNS-Secondary
- pve-mini* → Proxmox-Node-N
- nas920, nas719 → NAS-Primary, NAS-Secondary

## Deployment

Automatic via GitHub Actions on push to `main`. Workflow in `.github/workflows/deploy.yml`.

**Requirements:** Hugo Extended 0.146.0+ (PaperMod theme requirement)

## Related

- **Source repo:** `homelab-infra` (private infrastructure code)
- **Journal skill:** Use `/mx-homelab-journal` in Claude Code to create new posts with automatic sanitization
- **Theme:** re-terminal (custom dark terminal theme)
