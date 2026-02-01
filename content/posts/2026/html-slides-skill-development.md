---
title: "Building a Claude Code Skill from a YouTube Tutorial"
date: 2026-02-01
tags: ["lesson-learned", "tutorial"]
topics: ["claude-code", "presentations", "skill-development", "automation"]
difficulties: ["intermediate"]
---

## The Challenge

I watched a YouTube video titled "I Stopped Using PowerPoint Once I Learned This Claude Method" that demonstrated creating presentations using HTML instead of PowerPoint. The approach was compelling: single HTML files that run in browsers, support full CSS animations, and can be deployed to GitHub Pages for instant sharing.

But here's the thing - I already had a `pptx` skill installed that generates actual PowerPoint files. Should I replace it? Enhance it? Or build something new?

## The Discovery Process

### Step 1: Understand What Exists

Before building anything, I explored the existing presentation skill:

```bash
# Find existing presentation-related skills
find ~/.claude/skills -name "*ppt*" -o -name "*slide*"
```

The existing `pptx` skill lives at `~/.claude/plugins/marketplaces/awesome-claude-skills/document-skills/pptx/` and uses a Node.js toolchain (html2pptx.js + PptxGenJS) to generate actual `.pptx` files.

**Key insight:** The video's approach isn't a replacement - it's a complement. Different output formats serve different needs.

### Step 2: Analyze the Approaches

| Aspect | PPTX Skill | HTML Slides (Video Method) |
|--------|------------|----------------------------|
| **Output** | `.pptx` files | Single `.html` file |
| **Dependencies** | Node.js toolchain | None (vanilla HTML/CSS/JS) |
| **Sharing** | Email attachment | URL via GitHub Pages |
| **Animations** | PowerPoint-limited | Full CSS animations |
| **Best For** | Corporate/PowerPoint required | Modern/shareable/unique designs |

### Step 3: Extract the Technical Requirements

From the video transcript, I identified the core technical requirements:

1. **Single HTML file** - All CSS and JS embedded (no external dependencies)
2. **CSS scroll-snap** - Native slide-to-slide navigation
3. **Keyboard navigation** - Arrow keys, space, home/end
4. **Touch support** - Swipe gestures for mobile
5. **Progress indicator** - Visual feedback on position
6. **Animations** - Staggered bullet reveals, fade-in effects
7. **GitHub Pages deployment** - Simple sharing workflow

## The Implementation

### Skill Structure

I created a new skill at `~/.claude/skills/html-slides/`:

```
html-slides/
├── SKILL.md                          # Main documentation
└── references/
    ├── system-prompt-template.md     # Claude Project setup
    └── examples.md                   # Complete HTML templates
```

### Core Navigation Pattern

The video emphasized CSS scroll-snap for slide navigation:

```css
html {
    scroll-snap-type: y mandatory;
    overflow-y: scroll;
}

.slide {
    width: 100vw;
    height: 100vh;
    scroll-snap-align: start;
}
```

This creates a "click and snap" experience - each slide fills the viewport, and scrolling snaps to the next slide boundary.

### Animation System

For the staggered bullet animations the video highlighted:

```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.slide.active li {
    animation: fadeInUp 0.6s ease-out forwards;
}

.slide.active li:nth-child(1) { animation-delay: 0.1s; }
.slide.active li:nth-child(2) { animation-delay: 0.2s; }
.slide.active li:nth-child(3) { animation-delay: 0.3s; }
```

The `.active` class is added by JavaScript when a slide enters the viewport, triggering the animations only when the user sees the slide.

### Keyboard + Touch Navigation

```javascript
// Keyboard
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
            e.preventDefault();
            updateSlide(currentSlide + 1);
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            updateSlide(currentSlide - 1);
            break;
    }
});

// Touch swipe
let touchStartY = 0;
document.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', e => {
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {  // 50px threshold
        updateSlide(currentSlide + (diff > 0 ? 1 : -1));
    }
});
```

## What I Learned

### 1. Complement, Don't Replace

The instinct might be to replace an existing tool when you find something "better." But the PPTX skill still has its place - corporate environments, email attachments, offline viewing. The HTML approach shines for web sharing and modern animations. Both coexist.

### 2. Single-File Output is Powerful

No dependencies = maximum portability. The HTML file works offline, can be hosted anywhere, and doesn't require any build process. This constraint is a feature.

### 3. CSS Scroll-Snap is Underutilized

I'd seen scroll-snap for carousels but never thought to use it for presentations. The native browser behavior handles the heavy lifting - no JavaScript library needed.

### 4. Skill Discovery Matters

Before building, I explored what already existed. This prevented duplication and helped me understand where the new skill fits in the ecosystem.

## The Result

The `html-slides` skill is now available via `/html-slides` in Claude Code. Usage is simple:

```
Create an HTML presentation about [topic]

Content:
- [Your outline]

Style: professional/creative/minimal/bold
```

It generates a single HTML file with:
- Modern dark theme (customizable)
- CSS scroll-snap navigation
- Keyboard + touch support
- Animated bullet reveals
- Progress bar and slide counter

For GitHub Pages deployment:
1. Create a repository
2. Upload as `index.html`
3. Enable Pages in settings
4. Share the URL

## Files Created

| File | Purpose |
|------|---------|
| `SKILL.md` | 15KB - Workflows, design system, CSS/JS templates |
| `references/system-prompt-template.md` | 5KB - Claude Project setup for consistent generation |
| `references/examples.md` | 12KB - Complete HTML templates (dark theme, stats, timeline, etc.) |

The skill is tracked in `claude-config` repository and synced to `~/.claude/skills/` via symlink for immediate availability.

---

**Takeaway:** Learning from video content can be systematically transformed into reusable skills. The key is understanding what exists, identifying the unique value, and building something that complements rather than competes.
