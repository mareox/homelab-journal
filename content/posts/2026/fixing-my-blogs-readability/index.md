---
title: "I Built 15 Blog Posts Before Noticing My Own Site Was Broken"
date: 2026-04-02
tags: ["lesson-learned", "meta"]
topics: ["hugo", "web-design"]
---

## TL;DR

My technical blog was squeezing code blocks, tables, and ASCII diagrams into a 650px column designed for novel paragraphs. One CSS line fixed it. The real lesson: defaults optimized for one use case silently degrade another.

---

## The Problem I Didn't See

I'd been publishing posts for months. Tutorials with wide code blocks. Architecture posts with ASCII flow diagrams. Tables comparing tools and alternatives. Every single one was being crushed into `65ch` — roughly 650 pixels of width.

That's the Tailwind CSS `max-w-prose` class. It's the default in my Hugo theme ([Blowfish](https://blowfish.page)), and it exists for a good reason: research shows that 50-75 characters per line is optimal for reading prose. Your eyes can track line beginnings more easily when columns are narrow.

But I wasn't writing prose. I was writing technical documentation — and I never noticed because **I was always looking at my content in a code editor, not a browser.**

Here's what a typical code block looked like on the live site:

```text
┌─────────────────────┐  ┌──────────────────────┐  ┌──────────
│  Pi-hole A Records  │  │  UniFi Controller    │  │  PAN-OS D
│  (static infra)     │  │  (device fingerprint)│  │  (dynamic
│                     │  │                      │  │
│  69 devices         │  │  46 devices          │  │  54 leases
└────────┬────────────┘  └──────────┬───────────┘  └────────┬──
```

See where it clips? The third column just falls off the edge. Readers had to scroll horizontally inside the code block to see the rest. Tables were even worse — columns collapsed and text wrapped mid-word.

---

## The Fix (Two Lines of CSS)

The Blowfish theme applies `max-w-prose` to two elements: the article header and the `.article-content` wrapper. I overrode both in my custom CSS:

```css
#single_header,
.article-content {
  max-width: min(120ch, calc(100vw - 4rem));
}
```

That's it. No theme files modified. No layout templates overridden. Just a CSS override that survives theme updates.

**What `min()` does here:**

| Screen Size | What Wins | Result |
|---|---|---|
| Phone / narrow laptop | `calc(100vw - 4rem)` | Content fills the viewport minus padding |
| Standard desktop | `calc(100vw - 4rem)` | Content uses available space |
| Ultrawide monitor | `120ch` | Caps at ~1200px so lines stay readable |

The function picks the *smaller* value, so you always get the tightest sensible constraint for the current screen.

---

## Why I Didn't Notice Sooner

Three reasons:

**1. I write in VS Code, not the browser.** My editor shows the full-width markdown. The narrowing only happens after Hugo builds the HTML and the browser renders it. I'd preview occasionally, but I was looking at *content accuracy*, not *layout quality*.

**2. The theme default is correct — for prose.** `65ch` is genuinely the right width for paragraphs of text. The Blowfish theme is well-designed. The mismatch is between what the theme optimizes for (blog posts, essays) and what I'm actually publishing (technical documentation with wide artifacts).

**3. Horizontal scroll is subtle.** Code blocks in the theme get a scrollbar when they overflow, but it's a thin, auto-hiding scrollbar. On most posts, you wouldn't realize content was being clipped unless you happened to look for it.

---

## The Takeaway

**Defaults are someone else's opinion about your use case.**

Every tool, framework, and theme ships with sensible defaults. But "sensible" means "optimized for the average user." If your use case differs from the average — and technical blogs are very different from personal essays — those defaults silently degrade your work.

The fix took 2 minutes. The real cost was the 15 posts published with a suboptimal reading experience.

**Things I'm checking now:**
- Are my SVG diagrams rendering at a reasonable size?
- Do tables have enough room on mobile?
- Are code blocks readable without horizontal scroll?

If you're running a technical blog on any theme — Hugo, Next.js, Astro, whatever — open your most complex post on your phone and your widest monitor. You might be surprised.

---

*Fixed with one CSS override in a [custom stylesheet](https://github.com/mareox/homelab-journal). No theme files harmed in the process.*
