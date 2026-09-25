# AGENTS.md: homelab-journal

Canonical agent contract for this public Hugo blog. `CLAUDE.md` imports it with
`@AGENTS.md`. Read [README.md](README.md) for setup, layout and the configured
Blowfish theme. Read [CONTENT_PLAYBOOK.md](CONTENT_PLAYBOOK.md) before drafting
posts or diagrams.

## Public content boundary

This repository is public; `homelab-infra` is private. Never paste real
addresses, hostnames, domains, credentials, internal topology or customer data
into posts, generated assets or examples. Use `<YOUR_IP>`, `<YOUR_DOMAIN>`,
`<YOUR_PASSWORD>` and role names such as `Resolver-Primary` or `Proxmox-Node-1`.
Redact screenshots before capture. Run `node scripts/sanitize.js --validate
<file>` and `node scripts/validate-content.js --file <file>` before publishing.
`node scripts/sanitize.js <file>` replaces detected values; review its output,
since automation is not a confidentiality guarantee.

## Local commands

`hugo server -D` includes drafts; `hugo --minify` builds the production site.
Run `git submodule update --init --recursive` after cloning to fetch Blowfish.
Hugo Extended 0.146.0 or newer is required. The site publishes automatically
through `.github/workflows/deploy.yml` when `main` is pushed.

Create content with `hugo new journal/YYYY-MM-DD-topic.md`, `hugo new
tutorials/my-tutorial.md` or the matching archetype in `archetypes/`. Journal
entries are short work logs; posts include full context and lessons; wiki
pages are evergreen. Use page bundles (`index.md` and co-located assets) for
content with images or diagrams. The complete layout and theme settings are in
[README.md](README.md).

## Links and visuals

Use Hugo `relref` shortcodes for internal links, for example
`[Networking]({{< relref "/wiki/networking" >}})`. Bare `/wiki/networking/`
links break under the `/homelab-journal/` base URL. Strict taxonomies:
`tags` describe content type; `topics` describe technology; `difficulties` are
beginner, intermediate or advanced.

Diagrams use hand-crafted SVG page resources, not Mermaid. Follow
[CONTENT_PLAYBOOK.md](CONTENT_PLAYBOOK.md#svg-diagram-design-system) for arrow
direction, connector semantics, layout and design tokens. After SVG edits, run
`uv run --no-project python scripts/svg_lint.py content`; CI runs it before Hugo and fails on
malformed XML, undefined marker references and perpendicular arrowheads.

## Writing and publishing

Posts should sound like the author: natural, story-driven, occasionally funny,
never generic release notes. Lead with friction or result, explain the decision
and end with a transferable lesson. [CONTENT_PLAYBOOK.md](CONTENT_PLAYBOOK.md)
owns pre-publish quality gates, visual density and social distribution. Use
`/mx-homelab-journal` for blog creation and `/mx-social-post` for social drafts
when available. A sanitized build is not proof that the narrative is accurate.
