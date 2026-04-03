# Site Improvements Roadmap

UI/UX review conducted 2026-04-03. Prioritized by impact.

## Quick Wins (config/content changes only)

### 1. Reorder homepage sections
Move "Recent" posts above "Featured Content" and "Explore by Interest". LinkedIn visitors want the latest post immediately, not a tag cloud.

**File:** `content/_index.md` or homepage layout override

### 2. Remove or replace "What's Running" section
The tiny service screenshots are unreadable at thumbnail size. Replace with a short text list of infrastructure highlights (50+ services, 6 VLANs, 4-node Proxmox cluster) or remove entirely.

**File:** `content/_index.md`

### 3. Slim down tag display on posts
Keep `tags` to 2-3 content-type items only (tutorial, lesson-learned). Technology keywords belong in `topics`. Not all topics need to render as pill badges in the post header.

**File:** Per-post front matter + potentially theme override for `topics` rendering

### 4. Move "Built with AI" to footer or About page
A bold callout on the homepage makes readers question authorship. A small footnote like "Written with the help of Claude Code" in the footer is better.

**File:** `content/_index.md`

### 5. Add difficulty badges
Posts with `difficulties: ["intermediate"]` should render as colored badges (beginner=green, intermediate=yellow, advanced=red). Helps readers self-select.

**File:** Theme partial override or shortcode

---

## Medium Effort (theme customization)

### 6. Add "Start Here" or "Popular Posts" section
Pin 3-4 best posts on the homepage. Gives LinkedIn visitors a curated entry point instead of reverse-chronological list.

### 7. Featured post card styling
Make `featured: true` posts render with a larger card, accent border, or "Featured" badge. Currently `featured` is invisible to readers.

### 8. Reading progress bar
Thin accent-colored bar at the top of post pages that fills as you scroll. CSS-only, ~20 lines. Important for 700+ line tutorials.

### 9. Section dividers with contrast
Between homepage sections, add subtle background color changes (slightly lighter dark panels) to create visual rhythm and break monotony.

---

## Longer Term

### 10. Series navigation
Use the `series` taxonomy to link posts together with prev/next navigation ("Homelab Security", "PAN-OS" series).

### 11. RSS callout
Add a "Subscribe via RSS" badge in the footer or post sidebar. Engineers love RSS. Blowfish supports it natively.

### 12. About page hero image
Replace the generic cybersecurity hologram with something more personal/authentic (homelab rack photo, network diagram, terminal screenshot).

---

## Accessibility Issues

- Homepage hero image needs alt text
- All post featured images should have descriptive alt text
- Verify 4.5:1 color contrast ratio for muted text on dark background

---

## Current Strengths (Keep These)

- Dark mode default (perfect for engineering audience)
- Table of Contents on long posts
- Code copy button enabled
- Clean Blowfish theme with good typography
- Tag and topic taxonomy for discovery
- Search enabled via Fuse.js

---

*Last reviewed: 2026-04-03*
