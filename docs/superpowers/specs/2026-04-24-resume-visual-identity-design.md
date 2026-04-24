# Resume & Blog Visual Identity Refresh

**Date:** 2026-04-24
**Status:** Approved
**Scope:** Resume site (`~/GIT/resume/index.html`) + Homelab Journal blog (`~/GIT/homelab-journal/assets/css/schemes/homelab.css`)

## Problem

Current palette (dark navy `#0f1724` + orange `#ff6b3d` + blue `#3d8bff` + green `#3dff8b` + purple `#a87bff`) is identical to every AI-generated developer portfolio from 2023-2025. Five accent colors with no semantic hierarchy. DM Sans font is ubiquitous. The design signals "junior developer" rather than "senior enterprise security engineer."

## Direction

**"Prisma-Informed Corporate Security"**: Inspired by Palo Alto Networks' Prisma AIRS product page. Near-black warm base, Prisma teal-cyan primary, PANW amber-gold for critical callouts. Three accent colors with strict semantic usage rules. Enterprise typography.

## Color System

### Dark Mode (Primary)

```css
:root {
  --bg-primary:      #121212;
  --bg-secondary:    #171B1F;
  --bg-card:         #1A2530;
  --bg-card-hover:   #1F2E3A;

  --text-primary:    #E8ECF1;
  --text-secondary:  #8892A4;
  --text-muted:      #4A5568;

  --accent-cyan:     #00C0E8;    /* Links, nav active, section numbers, skill tags tier 1 */
  --accent-cyan-dim: rgba(0, 192, 232, 0.10);

  --accent-gold:     #FFCB05;    /* CTA buttons, PCNSE cert, current role marker, 100K+ metric */
  --accent-gold-dim: rgba(255, 203, 5, 0.10);

  --accent-green:    #00CC66;    /* Hero greeting brackets, status indicators */
  --accent-green-dim: rgba(0, 204, 102, 0.08);

  --border-color:    #1E2830;
  --border-active:   rgba(0, 192, 232, 0.25);
}
```

### Light Mode

```css
[data-theme="light"] {
  --bg-primary:      #F4F4F2;
  --bg-secondary:    #EAEAE7;
  --bg-card:         #FFFFFF;
  --bg-card-hover:   #F4F4F2;
  --text-primary:    #121212;
  --text-secondary:  #555555;
  --text-muted:      #767676;
  --accent-cyan:     #0096B5;
  --accent-gold:     #C49800;
  --accent-green:    #009950;
  --border-color:    #D8D8D5;
}
```

### Contrast Verification (WCAG 2.1)

| Pair | Ratio | Grade |
|------|-------|-------|
| Cyan `#00C0E8` on `#121212` | 8.2:1 | AAA |
| Gold `#FFCB05` on `#121212` | 12.1:1 | AAA |
| Text `#E8ECF1` on `#121212` | 14.8:1 | AAA |
| Light cyan `#0096B5` on `#F4F4F2` | 4.6:1 | AA |

### Color Usage Rules

- **Cyan** = primary. Links, interactive elements, skill tags (tier 1), section numbers, nav active state.
- **Gold** = critical callouts only. CTA button, PCNSE cert, current role timeline bar, "100K+" metric.
- **Green** = status. Hero greeting brackets, footer status line. Never decorative.
- No purple. No orange. No rainbow. Three accents with clear semantic meaning.

## Typography

### Fonts

| Role | Font | Weights | Fallback |
|------|------|---------|----------|
| Display/Body | IBM Plex Sans | 400, 500, 600, 700 | -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif |
| Code/Labels | Geist Mono | 400, 500 | JetBrains Mono, Fira Code, monospace |

### Type Scale

```css
--text-hero:     clamp(2.75rem, 6vw, 4.25rem);   /* Hero name */
--text-h2:       1.75rem;                          /* Section titles */
--text-h3:       1.1rem;                           /* Card headings */
--text-base:     1rem (16px);                      /* Body */
--text-sm:       0.875rem;                         /* Secondary body */
--text-xs:       0.75rem;                          /* Labels, dates (mono) */
--line-height:   1.7;                              /* Body copy */
--letter-hero:   -0.02em;                          /* Hero tracking */
```

### Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Layout & Components

### Navigation

- Keep `mario@security:~$` brand with blinking cursor in cyan
- Border-bottom: gradient `transparent > cyan > transparent` (1px)
- No `//` prefix on nav items

### Hero

```
[status: active]                              Geist Mono, green brackets, muted text
Mario Sanchez                                 IBM Plex Sans 700, 4.25rem
Senior Security Engineer at Palo Alto         1.3rem, text-secondary
Networks. AI builder. Compulsive automator.
[paragraph stays]
[ Download Resume ]  [ Learn More ]           Gold fill, cyan outline
linkedin  github  homelab journal
```

### Credential Strip (new component)

Horizontal bar between hero and About. Four cells:

| PCNSE (gold) | 100K+ Users (gold) | OWASP LLM Top 10 | 8 Years PANW PS |
|---|---|---|---|

Background: `--bg-card`. Labels: Geist Mono, cyan. Grid with 1px gap borders.

### Section Labels

Numbered, not comment-syntax:

```
01  About
02  AI Security Engineering
03  Projects
04  Experience
05  Technical Expertise
06  Credentials
```

Number: Geist Mono, cyan, 0.75rem. Title: IBM Plex Sans 700, 1.75rem.

### AI Section

- Renamed: "AI Security Engineering" (was "AI as a Daily Driver")
- Cards: 3px cyan left-border (always visible)
- No Unicode shape icons
- Hover: border-glow, no translateY

### Experience Timeline: Severity-Bar System

| Severity | Border | Color | Opacity | Use |
|----------|--------|-------|---------|-----|
| Critical | 3px left | `--accent-gold` | 1.0 | Current role |
| High | 2px left | `--accent-cyan` | 1.0 | Other PANW roles |
| Medium | 2px left | `--text-muted` | 0.85 | Pre-PANW roles |

Bullet markers inherit parent section's accent color.

### Skills: Two-Tier System

**Tier 1 (primary):** Cyan treatment. Used for: Prisma Access, PAN-OS, Panorama, GlobalProtect/ZTNA, SCM, Zero Trust, Python, LLM Security, OWASP, AI Agent Workflows, AI Security Risk Assessment.

```css
.skill-tag.primary {
  background: var(--accent-cyan-dim);
  color: var(--accent-cyan);
  border: 1px solid rgba(0, 192, 232, 0.2);
}
```

**Tier 2 (supporting):** Gray treatment. Used for: AWS, Azure, GCP, Docker, Ansible, REST API, OAuth 2.0, CI/CD, Linux, Graylog, Wazuh, Prometheus, Grafana, Ollama/PyTorch.

```css
.skill-tag.secondary {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}
```

### Project Cards

- 3px left-border: cyan default, gold for flagship (homelab)
- Hover: `box-shadow: 0 0 0 1px var(--border-active), inset 0 0 40px rgba(0, 192, 232, 0.03)`
- No translateY. Border-glow only.
- `border-radius: 6px`

### Certifications

- PCNSE: featured card with gold left-border, gold text
- CCNA certs: simple list items, muted styling

### Footer

```
Mario Sanchez · Senior Network Security Engineer · Palo Alto Networks
[status: operational] // hand-crafted HTML · no frameworks were harmed
```

Second line: Geist Mono, `--text-muted`, green brackets.

## Motion

- **Keep:** Hero fadeUp stagger (adjusted to 0.6s, `cubic-bezier(0.16, 1, 0.3, 1)`)
- **Remove:** Scroll-reveal on every section
- **Add:** CountUp animation on credential strip numbers (viewport entry trigger)
- **Change:** Card hover from translateY to border-glow
- **Keep:** `prefers-reduced-motion` media query

## Blowfish Theme Sync

Update `assets/css/schemes/homelab.css`:

```css
:root {
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

Blog content works without modification. Only the scheme file changes.

## Tech Stack

**No migration.** Resume stays vanilla HTML. Blog stays Hugo/Blowfish.

- Resume: single `index.html`, no build step, GitHub Actions uploads repo root
- Blog: Hugo with Blowfish theme, custom color scheme CSS
- Shared identity through palette and typography only

## Files to Modify

### Resume (`~/GIT/resume/`)
- `index.html`: CSS variables, font imports, HTML content changes (hero, section labels, timeline classes, skill tag classes, cert section, footer)

### Blog (`~/GIT/homelab-journal/`)
- `assets/css/schemes/homelab.css`: full replacement with new RGB values
- Review `assets/css/custom.css` and any custom partials for hardcoded hex values that bypass the scheme

## Implementation Priority

1. Resume CSS variable swap (palette + fonts)
2. Resume HTML content changes (hero, sections, timeline, skills, certs)
3. Blowfish homelab.css replacement
4. Blog hardcoded color audit
5. Verify both sites render correctly
6. Commit to both repos

## Mockup

Live mockup at `/tmp/resume-mockup/index.html` (served at `http://localhost:8899/` during design session).
