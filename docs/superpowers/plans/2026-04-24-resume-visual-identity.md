# Resume & Blog Visual Identity Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic navy+neon developer portfolio palette with a Prisma-informed corporate security identity across both the resume site and homelab journal blog.

**Architecture:** Two independent repos share a visual identity through palette and typography. Resume is a single `index.html` with embedded CSS. Blog uses Hugo/Blowfish with a custom color scheme CSS file. Changes propagate by updating CSS custom properties in both locations.

**Tech Stack:** Vanilla HTML (resume), Hugo + Blowfish theme (blog). No framework migration.

**Spec:** `docs/superpowers/specs/2026-04-24-resume-visual-identity-design.md`

**Reference mockup:** `/tmp/resume-mockup/index.html` (copy of final approved design)

---

## File Map

### Resume (`~/GIT/resume/`)
- **Modify:** `index.html` (lines 17, 29-51, 715-733, 826-841, 887-932, and HTML content throughout)

### Blog (`~/GIT/homelab-journal/`)
- **Modify:** `assets/css/schemes/homelab.css` (full replacement)
- **Modify:** `assets/css/custom.css` (lines 90-92, 157, 364, 744, 748, 796, 898-901 have hardcoded old palette values)

---

### Task 1: Resume CSS Variables and Font Import

**Files:**
- Modify: `~/GIT/resume/index.html:17` (font import)
- Modify: `~/GIT/resume/index.html:29-51` (CSS custom properties)
- Modify: `~/GIT/resume/index.html:49-50` (font-family variables)

- [ ] **Step 1: Replace the Google Fonts import (line 17)**

Change from:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

To:
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace the `:root` CSS custom properties block (lines 29-51)**

Replace the entire `:root` block with:
```css
:root {
  --bg-primary: #121212;
  --bg-secondary: #171B1F;
  --bg-card: #1A2530;
  --bg-card-hover: #1F2E3A;
  --text-primary: #E8ECF1;
  --text-secondary: #8892A4;
  --text-muted: #4A5568;
  --accent-red: #00C0E8;
  --accent-red-dim: rgba(0, 192, 232, 0.10);
  --accent-blue: #00C0E8;
  --accent-blue-dim: rgba(0, 192, 232, 0.10);
  --accent-green: #00CC66;
  --accent-green-dim: rgba(0, 204, 102, 0.08);
  --accent-yellow: #FFCB05;
  --accent-purple: #8892A4;
  --border-color: #1E2830;
  --border-glow: rgba(0, 192, 232, 0.25);
  --nav-height: 64px;
  --max-width: 1200px;
  --font-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
}
```

Note: We keep the old variable names (`--accent-red`, `--accent-blue`, etc.) to avoid changing every CSS rule that references them. `--accent-red` now maps to cyan. This is a deliberate palette swap, not a refactor of variable names.

- [ ] **Step 3: Open the file in a browser and verify colors changed**

Run: Open `~/GIT/resume/index.html` directly in a browser.
Expected: Dark near-black background, cyan accents instead of orange, IBM Plex Sans font rendering.

- [ ] **Step 4: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: swap palette to Prisma-informed corporate security theme

Replace navy+orange with near-black+cyan+gold.
Swap DM Sans for IBM Plex Sans, JetBrains Mono for Geist Mono."
```

---

### Task 2: Resume Light Mode Update

**Files:**
- Modify: `~/GIT/resume/index.html:715-733` (light mode CSS variables)

- [ ] **Step 1: Replace the `[data-theme="light"]` variable block**

Replace lines 715-733 with:
```css
[data-theme="light"] {
  --bg-primary: #F4F4F2;
  --bg-secondary: #EAEAE7;
  --bg-card: #ffffff;
  --bg-card-hover: #F4F4F2;
  --text-primary: #121212;
  --text-secondary: #555555;
  --text-muted: #767676;
  --accent-red: #0096B5;
  --accent-red-dim: rgba(0, 150, 181, 0.08);
  --accent-blue: #0096B5;
  --accent-blue-dim: rgba(0, 150, 181, 0.08);
  --accent-green: #009950;
  --accent-green-dim: rgba(0, 153, 80, 0.07);
  --accent-yellow: #C49800;
  --accent-purple: #555555;
  --border-color: #D8D8D5;
  --border-glow: rgba(0, 150, 181, 0.18);
}
```

- [ ] **Step 2: Update light mode nav background (line 736)**

Change `rgba(248, 250, 252, 0.92)` to `rgba(244, 244, 242, 0.92)`.

- [ ] **Step 3: Verify light mode toggle works in browser**

Toggle the theme button. Expected: warm off-white background, darker cyan accents, readable contrast.

- [ ] **Step 4: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: update light mode palette to match new identity"
```

---

### Task 3: Resume Navigation Updates

**Files:**
- Modify: `~/GIT/resume/index.html:69-80` (nav CSS)
- Modify: `~/GIT/resume/index.html:887-906` (nav HTML)

- [ ] **Step 1: Add blinking cursor CSS after the existing nav brand styles (after line 102)**

Add:
```css
.nav-brand .cursor {
  color: var(--accent-red);
  animation: blink 1.2s step-end infinite;
  margin-left: 2px;
}

@keyframes blink { 50% { opacity: 0; } }
```

- [ ] **Step 2: Change nav border-bottom to gradient (line 78)**

Replace:
```css
border-bottom: 1px solid var(--border-color);
```
With:
```css
border-bottom: 1px solid transparent;
border-image: linear-gradient(90deg, transparent, var(--accent-red), transparent) 1;
```

- [ ] **Step 3: Update nav brand HTML (line 889)**

Change:
```html
<div class="nav-brand"><span>mario</span>@security<span>:</span>~$</div>
```
To:
```html
<div class="nav-brand"><span>mario</span>@security<span>:</span>~$<span class="cursor">&#9612;</span></div>
```

- [ ] **Step 4: Verify blinking cursor appears in cyan in nav brand**

Expected: `mario@security:~$` with blinking block cursor in cyan.

- [ ] **Step 5: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: add blinking cursor to nav brand, gradient border"
```

---

### Task 4: Resume Hero Section Content

**Files:**
- Modify: `~/GIT/resume/index.html:909-933` (hero HTML)

- [ ] **Step 1: Replace hero greeting (line 911)**

Change:
```html
<p class="hero-greeting hero-anim">// hello, world</p>
```
To:
```html
<p class="hero-greeting hero-anim"><span style="color: var(--accent-green)">[</span>status: active<span style="color: var(--accent-green)">]</span></p>
```

- [ ] **Step 2: Update hero-greeting CSS color (around line 167)**

Change:
```css
color: var(--accent-green);
```
To:
```css
color: var(--text-muted);
```

- [ ] **Step 3: Update CTA button to gold (btn-primary)**

Change the `.btn-primary` CSS (lines 210-213):
```css
.btn-primary {
  background: var(--accent-yellow);
  color: #121212;
}
```

And `.btn-primary:hover` (lines 215-220):
```css
.btn-primary:hover {
  background: #FFD633;
  color: #121212;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255, 203, 5, 0.25);
}
```

- [ ] **Step 4: Verify hero displays `[status: active]` with green brackets, gold button**

- [ ] **Step 5: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: update hero greeting and CTA button to new identity"
```

---

### Task 5: Credential Strip Component

**Files:**
- Modify: `~/GIT/resume/index.html` (add CSS + HTML between hero and about sections)

- [ ] **Step 1: Add credential strip CSS (before the `/* ── About / Metrics */` comment)**

```css
/* ── Credential Strip ─────────────────── */
.credential-strip {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
}

.credential-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.credential-item {
  background: var(--bg-card);
  padding: 1.25rem 1.5rem;
  text-align: center;
}

.credential-value {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.credential-value.gold { color: var(--accent-yellow); }

.credential-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--accent-red);
  letter-spacing: 0.05em;
}
```

Add responsive rule inside the `@media (max-width: 768px)` block:
```css
.credential-inner { grid-template-columns: repeat(2, 1fr); }
```

Add responsive rule inside the `@media (max-width: 480px)` block:
```css
.credential-inner { grid-template-columns: 1fr; }
```

- [ ] **Step 2: Add credential strip HTML between `</section>` (end of hero) and `<section id="about">`**

```html
<!-- ── Credential Strip ────────────────────── -->
<div class="credential-strip">
  <div class="credential-inner">
    <div class="credential-item">
      <div class="credential-value gold">PCNSE</div>
      <div class="credential-label">Certified</div>
    </div>
    <div class="credential-item">
      <div class="credential-value gold">100K+</div>
      <div class="credential-label">Users Protected</div>
    </div>
    <div class="credential-item">
      <div class="credential-value">OWASP LLM Top 10</div>
      <div class="credential-label">Research</div>
    </div>
    <div class="credential-item">
      <div class="credential-value">8 Years</div>
      <div class="credential-label">PANW Professional Services</div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify credential strip renders between hero and about, PCNSE/100K+ in gold**

- [ ] **Step 4: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "feat: add credential strip component below hero"
```

---

### Task 6: Section Labels and AI Section Rename

**Files:**
- Modify: `~/GIT/resume/index.html` (all section label HTML)

- [ ] **Step 1: Update all section labels from `//` to numbered format**

Replace each section label. Here are all six:

```html
<!-- About section -->
<p class="section-label"><span style="opacity:0.7;font-size:0.7rem">01</span> About</p>

<!-- AI section -->
<p class="section-label"><span style="opacity:0.7;font-size:0.7rem">02</span> AI Security Engineering</p>
<h2 class="section-title">AI as a Force Multiplier</h2>

<!-- Projects section -->
<p class="section-label"><span style="opacity:0.7;font-size:0.7rem">03</span> Projects</p>

<!-- Experience section -->
<p class="section-label"><span style="opacity:0.7;font-size:0.7rem">04</span> Experience</p>

<!-- Skills section -->
<p class="section-label"><span style="opacity:0.7;font-size:0.7rem">05</span> Technical Expertise</p>

<!-- Certifications section -->
<p class="section-label"><span style="opacity:0.7;font-size:0.7rem">06</span> Credentials</p>
```

Also update the nav link text for AI section:
```html
<li><a href="#ai">AI Engineering</a></li>
```

- [ ] **Step 2: Remove the Unicode shape icons from AI cards (lines 985, 1002, 1019)**

Delete these three lines:
```html
<div class="ai-card-icon" aria-hidden="true">&#x25B8;</div>
<div class="ai-card-icon" aria-hidden="true">&#x25C6;</div>
<div class="ai-card-icon" aria-hidden="true">&#x25B2;</div>
```

- [ ] **Step 3: Verify numbered section labels appear, AI section renamed, no Unicode icons**

- [ ] **Step 4: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: numbered section labels, rename AI section, remove decorative icons"
```

---

### Task 7: AI Cards and Project Cards Styling

**Files:**
- Modify: `~/GIT/resume/index.html` (CSS for ai-card, project-card)

- [ ] **Step 1: Update AI card CSS to use left-border and glow hover**

Replace the `.ai-card` block (lines 308-316):
```css
.ai-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--accent-red);
  border-radius: 6px;
  padding: 2rem;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;
}
```

Remove the `.ai-card::before` pseudo-element block (lines 318-327). Delete it entirely.

Replace `.ai-card:hover::before` (line 329) and `.ai-card:hover` (lines 331-335) with:
```css
.ai-card:hover {
  border-color: var(--border-glow);
  border-left-color: var(--accent-red);
  box-shadow: 0 0 0 1px var(--border-glow), inset 0 0 40px rgba(0, 192, 232, 0.03);
}
```

- [ ] **Step 2: Update project card CSS for left-border and no translateY**

Replace `.project-card` (lines 540-548):
```css
.project-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--accent-red);
  border-radius: 6px;
  padding: 1.75rem;
  transition: all 0.25s;
  display: flex;
  flex-direction: column;
}
```

Replace `.project-card:hover` (lines 550-554):
```css
.project-card:hover {
  border-color: var(--border-glow);
  border-left-color: var(--accent-red);
  box-shadow: 0 0 0 1px var(--border-glow), inset 0 0 40px rgba(0, 192, 232, 0.03);
}
```

- [ ] **Step 3: Add `flagship` class to the homelab project card HTML**

Add class to the first project card div:
```html
<div class="project-card" style="border-left-color: var(--accent-yellow);">
```

- [ ] **Step 4: Verify cards have cyan left-border, homelab card has gold, hover shows glow not float**

- [ ] **Step 5: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: left-border accent on cards, glow hover, no translateY"
```

---

### Task 8: Experience Timeline Severity Bars

**Files:**
- Modify: `~/GIT/resume/index.html` (timeline CSS + HTML)

- [ ] **Step 1: Replace timeline CSS**

Remove the existing `timeline::before` gradient line (lines 398-406). Replace the entire timeline section CSS (lines 391-471) with:

```css
.timeline { position: relative; }

.timeline-item {
  position: relative;
  margin-bottom: 3rem;
  padding-left: 2rem;
  border-left: 2px solid var(--accent-red);
}

.timeline-item.critical {
  border-left: 3px solid var(--accent-yellow);
}

.timeline-item.medium {
  border-left: 2px solid var(--text-muted);
  opacity: 0.85;
}

.timeline-date {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--accent-red);
  margin-bottom: 0.5rem;
}

.timeline-item.critical .timeline-date { color: var(--accent-yellow); }
.timeline-item.medium .timeline-date { color: var(--text-muted); }

.timeline-role {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.timeline-company {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.timeline-location {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.timeline-bullets { list-style: none; }

.timeline-bullets li {
  position: relative;
  padding-left: 1.2rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.timeline-bullets li::before {
  content: '\25B8';
  position: absolute;
  left: 0;
  color: var(--accent-red);
}

.timeline-item.critical .timeline-bullets li::before { color: var(--accent-yellow); }
.timeline-item.medium .timeline-bullets li::before { color: var(--text-muted); }
```

- [ ] **Step 2: Add severity classes to timeline HTML**

Add `critical` class to the first timeline-item (current role, Dec 2020):
```html
<div class="timeline-item critical">
```

The second and third timeline-items (CSE and TSE at PANW) stay without extra class (default = cyan/high).

Add `medium` class to the last two timeline-items (Aeris and eFX-Computer):
```html
<div class="timeline-item medium">
```

- [ ] **Step 3: Remove the `timeline-item::before` dot pseudo-elements**

The old CSS had colored dots (`:nth-child` targeting). The new CSS above does not include them, so they are already removed.

- [ ] **Step 4: Verify timeline shows gold bar for current role, cyan for PANW roles, muted for pre-PANW**

- [ ] **Step 5: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: severity-bar timeline system replacing color-cycling dots"
```

---

### Task 9: Skills Two-Tier System

**Files:**
- Modify: `~/GIT/resume/index.html` (skills CSS + HTML)

- [ ] **Step 1: Replace skill tag CSS**

Remove all color-specific `.skill-tag.red`, `.skill-tag.blue`, `.skill-tag.green`, `.skill-tag.purple`, `.skill-tag.yellow` rules (lines 501-531). Replace with:

```css
.skill-tag.primary {
  background: var(--accent-red-dim);
  color: var(--accent-red);
  border: 1px solid rgba(0, 192, 232, 0.2);
}

.skill-tag.secondary {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
```

- [ ] **Step 2: Update skill tag HTML classes**

Change all `skill-tag red` to `skill-tag primary` for: Prisma Access, PAN-OS NGFW, Panorama, GlobalProtect/ZTNA 2.0, Strata Cloud Manager, Zero Trust Architecture.

Change `skill-tag green` for Python to `skill-tag primary`.

Change `skill-tag purple` for LLM Security (OWASP Top 10), AI Agent Workflows, AI Security Risk Assessment to `skill-tag primary`.

Change `skill-tag purple` for Prompt Injection / Data Leakage to `skill-tag primary`.

Change all remaining tags to `skill-tag secondary`: AWS, Azure, GCP, Multi-cloud, Ansible/Docker, REST API, OAuth 2.0, CI/CD, LLM Inference, Docker/Proxmox/LXC, Linux, Graylog, Wazuh, Prometheus/Grafana.

- [ ] **Step 3: Verify two-tier rendering: cyan for primary skills, gray for supporting**

- [ ] **Step 4: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: two-tier skill tags replacing five-color rainbow"
```

---

### Task 10: Certifications Redesign

**Files:**
- Modify: `~/GIT/resume/index.html` (certifications CSS + HTML)

- [ ] **Step 1: Add featured cert CSS**

Add before the existing `.certs-list` rule:
```css
.cert-featured {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--accent-yellow);
  border-radius: 6px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cert-featured .cert-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--accent-yellow);
}
```

- [ ] **Step 2: Update certifications HTML**

Replace the PCNSE list item with a featured card. Change:
```html
<li class="cert-item">
  <span class="cert-year">2024</span>
  <span class="cert-name"><span class="cert-highlight">PCNSE</span> — Palo Alto Networks Certified Network Security Engineer (originally 2019)</span>
</li>
```

To (placed before the `<ul class="certs-list">`):
```html
<div class="cert-featured">
  <span class="cert-year">2024</span>
  <span class="cert-name">PCNSE — Palo Alto Networks Certified Network Security Engineer</span>
</div>
```

Remove the `.cert-highlight` color rule (line 620) since it references `--accent-red` which is now cyan. The featured card handles PCNSE visibility with gold.

- [ ] **Step 3: Verify PCNSE appears as featured card with gold border, CCNAs as simple list**

- [ ] **Step 4: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: PCNSE as featured cert card with gold accent"
```

---

### Task 11: Footer and Motion Updates

**Files:**
- Modify: `~/GIT/resume/index.html` (footer HTML + animation CSS)

- [ ] **Step 1: Update footer HTML (lines 1270-1283)**

Replace the footer personality line:
```html
<p style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">// hand-crafted HTML · no frameworks were harmed in the making of this resume</p>
```
With:
```html
<p style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;"><span style="color: var(--accent-green)">[</span>status: operational<span style="color: var(--accent-green)">]</span> // hand-crafted HTML · no frameworks were harmed</p>
```

- [ ] **Step 2: Update fadeUp animation timing (line 827)**

Change:
```css
animation: fadeUp 0.5s ease-out forwards;
```
To:
```css
animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
```

- [ ] **Step 3: Remove metric cards from About section**

Delete the entire `.metrics-grid` div from the About section HTML (the four cards: 100K+, 34, 8+, 50+). These numbers now live in the credential strip (Task 5) or in the about text.

Add the missing context to the about text. After "AWS, Azure, and GCP." add a new paragraph:
```html
<p>
  Manages infrastructure at scale: 34+ global regions, 50+ homelab services,
  and Python automation that eliminated 2,700+ manual configuration entries.
</p>
```

- [ ] **Step 4: Remove the `.metrics-grid` and `.metric-card` CSS rules (lines 255-288)**

Delete the entire metrics grid CSS block since the component is removed.

- [ ] **Step 5: Verify footer shows `[status: operational]`, hero animation is slightly slower, no metric cards in About**

- [ ] **Step 6: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: update footer, animation easing, move metrics to credential strip"
```

---

### Task 12: Remove Scroll Reveal Animation

**Files:**
- Modify: `~/GIT/resume/index.html` (CSS + JS + HTML)

- [ ] **Step 1: Remove the `.reveal` CSS class (lines 849-858)**

Delete:
```css
.reveal {
  opacity: 0;
  transform: translateY(15px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 2: Remove `class="reveal"` from all section tags in HTML**

Remove the `reveal` class from these sections: `#about`, `#ai`, `#projects`, `#experience`, `#skills`, `#certifications`.

Change `<section id="about" class="reveal">` to `<section id="about">`, etc.

- [ ] **Step 3: Remove the revealObserver JS block (lines 1343-1355)**

Delete:
```js
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
```

- [ ] **Step 4: Also remove the `.reveal` reduced-motion rule inside `@media (prefers-reduced-motion)`**

Delete:
```css
.reveal {
  opacity: 1;
  transform: none;
  transition: none;
}
```

- [ ] **Step 5: Verify all sections are visible immediately on page load (no fade-in on scroll)**

- [ ] **Step 6: Commit**

```bash
cd ~/GIT/resume
git add index.html
git commit -m "style: remove scroll-reveal animation from sections"
```

---

### Task 13: Blowfish Theme Color Scheme Update

**Files:**
- Modify: `~/GIT/homelab-journal/assets/css/schemes/homelab.css` (full replacement)

- [ ] **Step 1: Replace the entire contents of `homelab.css`**

```css
:root {
  /* Neutral scale: warm near-black replaces cool navy */
  --color-neutral:     232, 236, 241;
  --color-neutral-50:  232, 236, 241;
  --color-neutral-100: 200, 208, 220;
  --color-neutral-200: 136, 146, 164;
  --color-neutral-300: 74, 85, 104;
  --color-neutral-400: 31, 46, 58;
  --color-neutral-500: 26, 37, 48;
  --color-neutral-600: 23, 27, 31;
  --color-neutral-700: 18, 18, 18;
  --color-neutral-800: 18, 18, 18;
  --color-neutral-900: 18, 18, 18;

  /* Primary: Prisma teal-cyan replaces orange */
  --color-primary-50:  224, 247, 252;
  --color-primary-100: 179, 238, 248;
  --color-primary-200: 102, 218, 240;
  --color-primary-300: 51, 204, 235;
  --color-primary-400: 0, 192, 232;
  --color-primary-500: 0, 150, 181;
  --color-primary-600: 0, 115, 140;
  --color-primary-700: 0, 82, 100;
  --color-primary-800: 0, 52, 64;
  --color-primary-900: 0, 26, 32;

  /* Secondary: PANW amber-gold replaces blue */
  --color-secondary-50:  255, 251, 235;
  --color-secondary-100: 255, 240, 179;
  --color-secondary-200: 255, 224, 102;
  --color-secondary-300: 255, 214, 51;
  --color-secondary-400: 255, 203, 5;
  --color-secondary-500: 204, 162, 4;
  --color-secondary-600: 153, 122, 3;
  --color-secondary-700: 102, 81, 2;
  --color-secondary-800: 51, 41, 1;
  --color-secondary-900: 26, 20, 0;
}
```

- [ ] **Step 2: Run Hugo dev server and verify blog renders with new palette**

```bash
cd ~/GIT/homelab-journal && hugo server -D
```

Open `http://localhost:1313/homelab-journal/` and verify: near-black background, cyan accents for links/highlights, gold for secondary elements.

- [ ] **Step 3: Commit**

```bash
cd ~/GIT/homelab-journal
git add assets/css/schemes/homelab.css
git commit -m "style: update color scheme to Prisma-informed corporate security palette"
```

---

### Task 14: Blog Hardcoded Color Fixes

**Files:**
- Modify: `~/GIT/homelab-journal/assets/css/custom.css` (lines 90-92, 157, 364, 744, 748, 796, 898-901)

- [ ] **Step 1: Fix inline code colors (lines 90-93)**

Replace:
```css
article :not(pre) > code {
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
  background: rgba(61, 139, 255, 0.1);
  color: rgb(143, 192, 255);
  border: 1px solid rgba(61, 139, 255, 0.15);
}
```
With:
```css
article :not(pre) > code {
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
  background: rgba(var(--color-primary-400), 0.1);
  color: rgb(var(--color-primary-200));
  border: 1px solid rgba(var(--color-primary-400), 0.15);
}
```

- [ ] **Step 2: Fix header background (line 157)**

Replace:
```css
background: rgba(15, 23, 36, 0.88);
```
With:
```css
background: rgba(var(--color-neutral-900), 0.88);
```

- [ ] **Step 3: Fix hero overlay gradient (line 364)**

Replace:
```css
background: linear-gradient(180deg, rgba(15, 23, 36, 0.2), rgba(15, 23, 36, 0.92));
```
With:
```css
background: linear-gradient(180deg, rgba(var(--color-neutral-900), 0.2), rgba(var(--color-neutral-900), 0.92));
```

- [ ] **Step 4: Fix light mode header background (line 744)**

Replace:
```css
background: rgba(232, 237, 245, 0.92);
```
With:
```css
background: rgba(var(--color-neutral-50), 0.92);
```

- [ ] **Step 5: Fix light mode brand mark gradient (line 748)**

Replace:
```css
background: linear-gradient(145deg, #f0f4fa, #dde4f0);
```
With:
```css
background: linear-gradient(145deg, rgb(var(--color-neutral-50)), rgb(var(--color-neutral-100)));
```

- [ ] **Step 6: Fix light mode hero overlay (line 796)**

Replace:
```css
background: linear-gradient(180deg, rgba(232, 237, 245, 0.3), rgba(232, 237, 245, 0.95));
```
With:
```css
background: linear-gradient(180deg, rgba(var(--color-neutral-50), 0.3), rgba(var(--color-neutral-50), 0.95));
```

- [ ] **Step 7: Fix light mode inline code (lines 898-901)**

Replace:
```css
html:not(.dark) article :not(pre) > code {
  background: rgba(61, 139, 255, 0.07);
  color: rgb(var(--color-secondary-700));
  border-color: rgba(61, 139, 255, 0.12);
}
```
With:
```css
html:not(.dark) article :not(pre) > code {
  background: rgba(var(--color-primary-400), 0.07);
  color: rgb(var(--color-primary-700));
  border-color: rgba(var(--color-primary-400), 0.12);
}
```

- [ ] **Step 8: Verify blog in both dark and light modes, inline code blocks, header, hero**

- [ ] **Step 9: Commit**

```bash
cd ~/GIT/homelab-journal
git add assets/css/custom.css
git commit -m "fix: replace hardcoded color values with CSS custom properties"
```

---

### Task 15: Final Verification

**Files:**
- Read: `~/GIT/resume/index.html`
- Read: `~/GIT/homelab-journal/assets/css/schemes/homelab.css`
- Read: `~/GIT/homelab-journal/assets/css/custom.css`

- [ ] **Step 1: Open resume in browser, verify full page top to bottom**

Check:
- Nav: blinking cursor, gradient border
- Hero: `[status: active]`, gold CTA button
- Credential strip: PCNSE and 100K+ in gold
- About: no metric cards, text includes scale numbers
- AI section: numbered label, cyan left-border cards, no icons
- Projects: cyan left-border, homelab gold, glow hover
- Timeline: gold current role, cyan PANW, muted pre-PANW
- Skills: cyan primary, gray secondary, no rainbow
- Certs: PCNSE featured card with gold, CCNAs as list
- Footer: `[status: operational]`
- Light mode toggle works

- [ ] **Step 2: Open blog, verify dark and light modes**

```bash
cd ~/GIT/homelab-journal && hugo server -D
```

Check: cyan links, gold secondary, warm near-black background, no hardcoded old colors bleeding through.

- [ ] **Step 3: Run a grep for any remaining old palette values in resume**

```bash
cd ~/GIT/resume && grep -n '#0f1724\|#ff6b3d\|#3d8bff\|#3dff8b\|#a87bff\|#1a2740\|DM Sans' index.html
```

Expected: no matches.

- [ ] **Step 4: Run a grep for remaining hardcoded colors in blog CSS**

```bash
cd ~/GIT/homelab-journal && grep -rn 'rgba(15, 23, 36\|rgba(232, 237, 245\|rgba(61, 139, 255\|#f0f4fa\|#dde4f0' assets/css/
```

Expected: no matches.
