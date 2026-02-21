---
title: "Building a Claude Code Skill from a YouTube Tutorial"
date: 2026-02-01
tags: ["lesson-learned", "tutorial"]
topics: ["claude-code", "presentations", "skill-development", "automation"]
difficulties: ["intermediate"]
cover: "thumbnail.png"
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

```text
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

```text
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

## Complete SKILL.md Reference

Below is the full `SKILL.md` file that powers the html-slides skill. This serves as both documentation and instruction set for Claude Code when generating presentations.

<details>
<summary><strong>Click to expand SKILL.md (623 lines)</strong></summary>

```markdown
---
name: html-slides
description: "Create stunning HTML presentations that run in browsers. Use when creating modern, animated slide decks that can be shared via URL, hosted on GitHub Pages, or presented directly from a browser. Produces single HTML files with embedded CSS/JS - no PowerPoint needed."
---

# HTML Slides - Browser-Native Presentations

## Overview

Create beautiful, animated presentations as single HTML files that:
- Run directly in any web browser
- Support animations, transitions, and interactive elements
- Can be deployed to GitHub Pages for sharing
- Are truly customizable beyond PowerPoint constraints
- Work offline once downloaded

This skill follows the "code-based presentation" methodology - you don't need to know code, just describe what you want.

## When to Use This Skill

**Use HTML Slides when you want:**
- Modern, animated presentations
- Shareable via URL (GitHub Pages)
- Unique designs not possible in PowerPoint
- Interactive elements (hover effects, animations)
- Dark mode / high-contrast visuals
- Presentations that work on any device

**Use the PPTX skill instead when you need:**
- Actual .pptx files for corporate environments
- Compatibility with Microsoft PowerPoint
- Template-based corporate presentations

## Quick Start Workflow

### Step 1: Prepare Your Content

Before creating slides, prepare either:
- **Word-for-word script**: Exactly what you'll say per slide
- **Structured outline**: Bullets and sub-bullets for each slide

The AI needs content to reference for creating visuals.

### Step 2: Request the Presentation

When asking for a presentation, include:
1. Your content/script/outline
2. Desired tone (professional, creative, minimal, bold)
3. Any brand colors or preferences
4. Target audience

### Step 3: Review and Iterate

After receiving the first version:
- Request 1-2 rounds of changes
- Be specific: "Make the title slide more impactful" or "Add animation to the bullet points"
- For additional edits, download and use Cursor or Claude Code

### Step 4: Deploy (Optional)

To share via URL:
1. Create a GitHub repository
2. Upload the HTML file as `index.html`
3. Enable GitHub Pages in repository settings
4. Share the generated URL

---

## Technical Specification

### Output Format

All presentations are **single HTML files** containing:
- Embedded CSS (no external stylesheets)
- Embedded JavaScript (no external scripts)
- Self-contained assets (base64 images when possible)

### Slide Framework

Presentations use vanilla HTML/CSS/JS with:
- CSS scroll-snap for slide navigation
- CSS animations and transitions
- Keyboard navigation (arrow keys, space)
- Touch support for mobile devices

### Supported Features

**Navigation:**
- Arrow keys (left/right or up/down)
- Space bar (next slide)
- Click/tap navigation
- Progress indicator (optional)
- Slide counter

**Visual Elements:**
- Animated text reveals
- Fade/slide transitions between slides
- Shape animations
- Icon integration
- Charts (via inline SVG)
- Code syntax highlighting
- Images with effects

**Layout Options:**
- Full-bleed backgrounds
- Split layouts (50/50, 30/70, etc.)
- Grid layouts
- Centered content
- Sidebar layouts

---

## Design System

### Default Design Philosophy

**Principles:**
1. **Minimal text** - Maximum 3-5 bullet points per slide
2. **High contrast** - Dark backgrounds with light text (or inverse)
3. **Single accent color** per slide for focal points
4. **Modern minimalistic** aesthetic
5. **Clear visual hierarchy**

### Color Palettes

Choose a palette that matches your content's tone and subject matter:

#### Professional / Corporate
Dark Navy:    #1C2833 (background)
Slate:        #2E4053 (secondary)
Silver:       #AAB7B8 (text secondary)
Off-white:    #F4F6F6 (text primary)
Accent Blue:  #3498DB (highlights)

#### Creative / Bold
Deep Black:   #0D0D0D (background)
Charcoal:     #1A1A2E (cards)
Electric Blue: #00D4FF (accent)
White:        #FFFFFF (text)

#### Warm / Inviting
Burgundy:     #5D1D2E (background)
Crimson:      #951233 (secondary)
Rust:         #C15937 (accent)
Gold:         #997929 (highlights)
Cream:        #FAF7F2 (text)

#### Tech / Modern
Dark Gray:    #121212 (background)
Charcoal:     #1E1E1E (cards)
Neon Green:   #00FF88 (accent)
Purple:       #8B5CF6 (secondary accent)
White:        #FFFFFF (text)

#### Clean / Minimal
White:        #FFFFFF (background)
Light Gray:   #F5F5F5 (cards)
Dark Gray:    #333333 (text)
Blue:         #2563EB (accent)

### Typography

**Web-safe fonts only** (guaranteed to render correctly):

**Headers:**
- Arial Black (bold, impactful)
- Georgia (elegant, serif)
- Impact (dramatic)
- Trebuchet MS (modern, clean)

**Body Text:**
- Arial (clean, readable)
- Verdana (web-optimized)
- Georgia (elegant)
- Tahoma (compact)

**Code/Technical:**
- Courier New (monospace)

### Animation Presets

**Text Reveals:**
- Fade in from bottom (default)
- Stagger animation (bullet points)
- Typewriter effect (titles)
- Scale in (key numbers)

**Transitions:**
- Slide left/right (default navigation)
- Fade (gentle)
- Zoom (dramatic)
- None (instant)

---

## Slide Templates

### 1. Title Slide
- Large centered title
- Subtitle below
- Optional logo/icon
- Background color or image

### 2. Section Divider
- Large section number/name
- Minimal design
- Dramatic background

### 3. Content with Bullets
- Title at top
- 3-5 bullet points with icons
- Optional side image

### 4. Two Column
- Title spanning width
- Left column: text/bullets
- Right column: image/chart/code

### 5. Full Image
- Edge-to-edge background image
- Overlay text with contrast

### 6. Quote
- Large quote text
- Attribution below
- Dramatic styling

### 7. Stats/Numbers
- Large numbers with labels
- 2-4 key metrics
- Animation on reveal

### 8. Code Block
- Syntax-highlighted code
- Optional explanation text
- Dark theme (always)

### 9. Comparison
- Two or three columns
- Side-by-side comparison
- Icons for features

### 10. Timeline
- Horizontal or vertical
- 3-5 milestones
- Animated progression

### 11. Process Flow
- Steps with arrows/connectors
- Icons for each step
- Sequential animation

### 12. Closing/CTA
- Call to action
- Contact information
- Social links

---

## Implementation Guide

### HTML Structure

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presentation Title</title>
    <style>
        /* All CSS embedded here */
    </style>
</head>
<body>
    <div class="presentation">
        <section class="slide" id="slide-1">
            <!-- Slide content -->
        </section>
        <section class="slide" id="slide-2">
            <!-- Slide content -->
        </section>
        <!-- More slides... -->
    </div>

    <div class="progress-bar"></div>
    <div class="slide-counter">1 / 10</div>

    <script>
        /* All JS embedded here */
    </script>
</body>
</html>

### Core CSS (Base Template)

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
    scroll-snap-type: y mandatory;
    overflow-y: scroll;
}

body {
    font-family: 'Arial', sans-serif;
    background: #0D0D0D;
    color: #FFFFFF;
    line-height: 1.6;
}

.presentation {
    width: 100vw;
    height: 100vh;
}

.slide {
    width: 100vw;
    height: 100vh;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 5vw;
    position: relative;
    overflow: hidden;
}

/* Animations */
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

.slide.active .animate-in {
    animation: fadeInUp 0.6s ease-out forwards;
}

.slide .animate-in {
    opacity: 0;
}

/* Stagger animation for lists */
.slide.active li:nth-child(1) { animation-delay: 0.1s; }
.slide.active li:nth-child(2) { animation-delay: 0.2s; }
.slide.active li:nth-child(3) { animation-delay: 0.3s; }
.slide.active li:nth-child(4) { animation-delay: 0.4s; }
.slide.active li:nth-child(5) { animation-delay: 0.5s; }

/* Progress bar */
.progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #00D4FF, #8B5CF6);
    width: 0%;
    z-index: 1000;
    transition: width 0.3s ease;
}

/* Slide counter */
.slide-counter {
    position: fixed;
    bottom: 20px;
    right: 30px;
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    z-index: 1000;
}

### Core JavaScript (Navigation)

document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const progressBar = document.querySelector('.progress-bar');
    const counter = document.querySelector('.slide-counter');
    let currentSlide = 0;
    const totalSlides = slides.length;

    function updateSlide(index) {
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;

        currentSlide = index;
        slides[index].scrollIntoView({ behavior: 'smooth' });

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        const progress = ((index + 1) / totalSlides) * 100;
        progressBar.style.width = progress + '%';
        counter.textContent = `${index + 1} / ${totalSlides}`;
    }

    // Keyboard navigation
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
            case 'Home':
                e.preventDefault();
                updateSlide(0);
                break;
            case 'End':
                e.preventDefault();
                updateSlide(totalSlides - 1);
                break;
        }
    });

    // Touch/swipe support
    let touchStartY = 0;
    document.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', e => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                updateSlide(currentSlide + 1);
            } else {
                updateSlide(currentSlide - 1);
            }
        }
    });

    // Intersection Observer for scroll-based navigation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(slides).indexOf(entry.target);
                if (index !== currentSlide) {
                    currentSlide = index;
                    slides.forEach((slide, i) => {
                        slide.classList.toggle('active', i === index);
                    });
                    const progress = ((index + 1) / totalSlides) * 100;
                    progressBar.style.width = progress + '%';
                    counter.textContent = `${index + 1} / ${totalSlides}`;
                }
            }
        });
    }, { threshold: 0.5 });

    slides.forEach(slide => observer.observe(slide));
    updateSlide(0);
});

---

## Deployment to GitHub Pages

### Step-by-Step Guide

1. **Create a GitHub repository**
   - Go to github.com and click "New repository"
   - Name it (e.g., "my-presentation")
   - Make it public
   - Click "Create repository"

2. **Upload your files**
   - Click "uploading an existing file"
   - Drag your HTML file (rename to `index.html`)
   - Commit changes

3. **Enable GitHub Pages**
   - Go to Settings > Pages
   - Under "Source", select "Deploy from a branch"
   - Select "main" branch and "/ (root)"
   - Click Save

4. **Access your presentation**
   - Wait 2-5 minutes for deployment
   - URL format: `https://username.github.io/repository-name/`

### Important Notes

- The HTML file **must** be named `index.html`
- Files must be at the **root** of the repository (no folders)
- Repository must be **public** for free GitHub Pages

---

## Best Practices

### Content Guidelines

1. **One idea per slide** - Don't overcrowd
2. **Maximum 5 bullet points** - Preferably 3
3. **Use visuals over text** - Icons, charts, images
4. **Consistent terminology** - Use the same words throughout
5. **Progressive disclosure** - Build complex ideas over multiple slides

### Design Guidelines

1. **Contrast is king** - Ensure text readability
2. **Consistent spacing** - Use a grid system
3. **Limit fonts** - Maximum 2 font families
4. **Limit colors** - 3-4 colors maximum
5. **Animate purposefully** - Don't animate everything

### Technical Guidelines

1. **Test locally first** - Open in browser before deploying
2. **Check mobile view** - Resize browser to test
3. **Validate HTML** - Use browser dev tools
4. **Optimize images** - Use compressed formats or base64
5. **Keep file size reasonable** - Target under 2MB

---

## Troubleshooting

### Common Issues

**Slides don't snap correctly:**
- Check `scroll-snap-type` on html element
- Ensure each slide has `scroll-snap-align: start`

**Animations don't play:**
- Verify the `.active` class is being added
- Check animation CSS syntax
- Ensure `animation-fill-mode: forwards`

**Text is cut off:**
- Reduce font size or text amount
- Use `overflow: hidden` with `text-overflow: ellipsis`
- Adjust padding/margins

**Images don't load on GitHub Pages:**
- Use relative paths
- Embed as base64 for reliability
- Check file case sensitivity (GitHub is case-sensitive)

**Mobile layout broken:**
- Add viewport meta tag
- Use `vw/vh` units instead of pixels
- Test touch navigation

---

## Example Prompt Template

When requesting a presentation, use this template:

Create an HTML presentation with the following:

**Topic:** [Your presentation topic]

**Content/Script:**
[Paste your outline or script here]

**Style Preferences:**
- Tone: [professional/creative/minimal/bold]
- Colors: [specific colors or "choose appropriate"]
- Animations: [subtle/dynamic/none]

**Target Audience:** [who will view this]

**Number of Slides:** [approximate count]

**Special Requirements:**
- [Any specific needs like code blocks, charts, etc.]

---

## References

- [CSS Scroll Snap](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Scroll_Snap)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
```

</details>

---

**Takeaway:** Learning from video content can be systematically transformed into reusable skills. The key is understanding what exists, identifying the unique value, and building something that complements rather than competes.
