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
hugo new tutorials/my-tutorial.md
hugo new posts/2025/my-post.md
hugo new wiki/networking/topic.md

# Production build
hugo --minify
```

## Content Architecture

**Hybrid wiki/blog structure:**

| Section | Purpose | Path |
|---------|---------|------|
| Wiki | Evergreen reference by topic | `content/wiki/{topic}/` |
| Tutorials | Step-by-step how-tos | `content/tutorials/` |
| Posts | Chronological journey/lessons | `content/posts/{year}/` |
| Series | Multi-part learning paths | `content/series/` |

**Taxonomies:**
- `tags` - Content type (tutorial, lesson-learned, lab-note)
- `topics` - Technology (proxmox, docker, networking, dns)
- `difficulties` - beginner, intermediate, advanced

## Archetypes

Use `hugo new` to create content from templates in `archetypes/`:
- `tutorial.md` - Step-by-step guide with prerequisites, verification, troubleshooting
- `lesson-learned.md` - Post-mortem style with problem, solution, root cause
- `architecture.md` - System design with Mermaid diagrams
- `wiki.md` - Reference documentation

## Shortcodes

**Mermaid diagrams:**
```markdown
{{</* mermaid */>}}
graph TB
    A[Start] --> B[End]
{{</* /mermaid */>}}
```

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
- **Journal skill:** Use `/journal` in Claude Code to create new posts with automatic sanitization
- **Theme docs:** https://github.com/adityatelange/hugo-PaperMod
