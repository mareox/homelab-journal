---
title: "I Built 15 Blog Posts Before Noticing My Own Site Was Broken"
date: 2026-04-02
tags: ["lesson-learned", "meta"]
topics: ["hugo", "web-design"]
description: &excerpt "What I changed after finding that my own blog was harder to read than it needed to be."
summary: *excerpt
---

## TL;DR

My technical blog was squeezing code blocks, tables, and ASCII diagrams into a 650px column meant for paragraphs. A CSS override fixed the width.

---

## The Problem I Didn't See

I'd been publishing for months before I noticed that every tutorial code block, ASCII flow diagram, and comparison table had to fit inside `65ch`, roughly 650 pixels.

My Hugo theme, [Blowfish](https://blowfish.page), uses Tailwind CSS's `max-w-prose` class by default. For paragraphs, the width makes sense. At 50 to 75 characters per line, it's easier for your eyes to find the start of the next line.

I kept missing it because I worked in a full-width code editor. I rarely looked at the same post in a browser.

Here's what a typical code block looked like on the live site:

```text
┌─────────────────────┐  ┌──────────────────────┐  ┌──────────
│  Pi-hole A Records  │  │  UniFi Controller    │  │  PAN-OS D
│  (static infra)     │  │  (device fingerprint)│  │  (dynamic
│                     │  │                      │  │
│  69 devices         │  │  46 devices          │  │  54 leases
└────────┬────────────┘  └──────────┬───────────┘  └────────┬──
```

The third column falls off the edge. You have to scroll inside the code block to see the rest. In tables, narrow columns can wrap text mid-word.

---

## The Fix (Two Lines of CSS)

The Blowfish theme applies `max-w-prose` to two elements: the article header and the `.article-content` wrapper. I overrode both in my custom CSS:

```css
#single_header,
.article-content {
  max-width: min(120ch, calc(100vw - 4rem));
}
```

The override lives in my custom stylesheet, so I can update the theme without reapplying changes to its files or templates.

**What `min()` does here:**

| Screen Size | What Wins | Result |
|---|---|---|
| Phone / narrow laptop | `calc(100vw - 4rem)` | Content fills the viewport minus padding |
| Standard desktop | `calc(100vw - 4rem)` | Content uses available space |
| Ultrawide monitor | `120ch` | Caps at ~1200px so lines stay readable |

The function picks the *smaller* value, so you always get the tightest sensible constraint for the current screen.

---

## Why I Didn't Notice Sooner

**1. I write in VS Code.** My editor shows the full-width Markdown. When I did open a preview, I was checking the technical details and missed the layout.

**2. The theme is designed for paragraphs.** `65ch` makes sense for essays. My tables and wide diagrams needed more room.

**3. Horizontal scroll is subtle.** Code blocks in the theme get a scrollbar when they overflow, but it's a thin, auto-hiding scrollbar. On most posts, you wouldn't realize content was being clipped unless you happened to look for it.

---

## The Takeaway

The CSS took two minutes. It took 15 published posts for me to look closely enough to notice.

**Things I'm checking now:**
- Are my SVG diagrams rendering at a reasonable size?
- Do tables have enough room on mobile?
- Are code blocks readable without horizontal scroll?

If your posts use wide diagrams or code, open the busiest one on your phone and your widest monitor. Check the edges of the diagrams and code blocks.

---

*Fixed with one CSS override in a [custom stylesheet](https://github.com/mareox/homelab-journal). No theme files harmed in the process.*
