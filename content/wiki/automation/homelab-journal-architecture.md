---
title: "Architecture: Homelab Journal Site Structure"
date: 2025-01-24
tags: ["architecture", "hugo", "documentation"]
topics: ["automation", "documentation"]
difficulties: ["intermediate"]
description: "How this blog is organized - topic-based wiki meets chronological posts"
---

## Overview

This site uses a **hybrid content structure** that combines the best of wikis and blogs. Instead of choosing between "everything chronological" or "everything by topic," we get both:

- **Wiki sections** for evergreen reference content (organized by topic)
- **Blog posts** for journey updates and lessons learned (organized by date)
- **Tutorials** for step-by-step guides (standalone, searchable)
- **Series** for multi-part deep dives (linked learning paths)

## Content Architecture

{{< mermaid >}}
graph TB
    subgraph "Content Types"
        W[Wiki<br/>Evergreen Reference]
        T[Tutorials<br/>Step-by-Step Guides]
        P[Posts<br/>Journey & Lessons]
        S[Series<br/>Multi-Part Learning]
    end

    subgraph "Wiki Topics"
        W --> V[Virtualization<br/>Proxmox, LXC, Docker]
        W --> N[Networking<br/>VLANs, DNS, Firewalls]
        W --> A[Automation<br/>n8n, Scripts, CI/CD]
        W --> M[Monitoring<br/>Logging, Alerts]
    end

    subgraph "Post Categories"
        P --> LN[Lab Notes<br/>Quick Tips]
        P --> LL[Lessons Learned<br/>Post-Mortems]
        P --> UP[Updates<br/>What's New]
    end

    subgraph "Output"
        V & N & A & M --> WIKI["/wiki/*"]
        T --> TUT["/tutorials/*"]
        LN & LL & UP --> POSTS["/posts/YYYY/*"]
        S --> SER["/series/*"]
    end
{{< /mermaid >}}

## Directory Structure

{{< mermaid >}}
flowchart TB
    subgraph CONTENT["📂 content/"]
        subgraph WIKI["📚 wiki/"]
            direction TB
            V["virtualization/<br/><i>Proxmox, containers, VMs</i>"]
            NET["networking/<br/><i>VLANs, DNS, security</i>"]
            AUTO["automation/<br/><i>Scripts, n8n, pipelines</i>"]
            MON["monitoring/<br/><i>Logging, alerting</i>"]
        end
        TUT["📖 tutorials/<br/><i>Standalone how-tos</i>"]
        subgraph POSTS["📝 posts/"]
            Y2025["2025/<br/><i>Year-based organization</i>"]
        end
        SER["📚 series/<br/><i>Multi-part content</i>"]
    end

    classDef folder fill:#fff3e0,stroke:#e65100
    classDef wiki fill:#e3f2fd,stroke:#1565c0
    classDef tut fill:#e8f5e9,stroke:#2e7d32

    class CONTENT folder
    class WIKI wiki
    class TUT,SER,POSTS tut
{{< /mermaid >}}

## Why This Structure?

### Problem: Wiki vs Blog Dilemma

Most homelab documentation falls into two camps:

1. **Pure Blog** - Great for following someone's journey, but hard to find specific info later
2. **Pure Wiki** - Great for reference, but loses the narrative and lessons learned

### Solution: Hybrid Approach

| Content Type | Organization | Purpose | Example |
|-------------|--------------|---------|---------|
| Wiki | By topic | Quick reference, "how does X work?" | "Keepalived VRRP basics" |
| Tutorial | Standalone | "How do I set up X?" | "HA Pi-hole with Keepalived" |
| Post | By date | "What happened? What did I learn?" | "The day DNS failed" |
| Series | Linked sequence | Deep dives that build on each other | "Building a Proxmox Cluster" |

## Content Lifecycle

{{< mermaid >}}
flowchart TB
    WORK["🔧 Do homelab work"]
    SKILL["⚡ Run /journal skill"]
    SELECT["📋 Select content type"]
    QUICK["❓ Quick?"]
    DEEP["❓ Deep?"]
    POST["📝 Post"]
    TUT["📖 Tutorial/Wiki"]
    PUBLISH["🚀 Published to GitHub Pages"]

    WORK --> SKILL --> SELECT
    SELECT --> QUICK
    SELECT --> DEEP
    QUICK --> POST
    DEEP --> TUT
    POST --> PUBLISH
    TUT --> PUBLISH

    classDef process fill:#e3f2fd,stroke:#1565c0
    classDef decision fill:#fff3e0,stroke:#e65100
    classDef output fill:#e8f5e9,stroke:#2e7d32

    class WORK,SKILL,SELECT process
    class QUICK,DEEP decision
    class POST,TUT,PUBLISH output
{{< /mermaid >}}

## Design Decisions

### 1. Topic-First for Wiki

Wiki content is organized by **what it's about**, not when it was written. This makes it easy to find related content:

- All DNS stuff → `/wiki/networking/`
- All container stuff → `/wiki/virtualization/`

### 2. Year-Based for Posts

Posts are organized by year to:
- Keep URLs stable and predictable
- Allow browsing by time period
- Avoid overly deep nesting

### 3. Flat Tutorials

Tutorials live in a single `/tutorials/` directory because:
- They're meant to be found via search/tags
- Nesting would add friction to publishing
- Tags provide the categorization

### 4. Tags + Topics Taxonomy

Two separate taxonomies serve different purposes:

- **Tags**: Content type (`tutorial`, `lesson-learned`, `lab-note`)
- **Topics**: Technology (`proxmox`, `docker`, `networking`, `dns`)

This allows queries like "all lessons learned about DNS" or "all tutorials about Proxmox."

## Trade-offs

| Decision | Gain | Cost |
|----------|------|------|
| Hybrid structure | Best of both worlds | More complex to maintain |
| Flat tutorials | Easy publishing | Less topic grouping |
| Year-based posts | Stable URLs | Manual year folders |
| Dual taxonomy | Flexible queries | More tags to manage |

## What's Next

- Add more wiki reference content
- Create first tutorial (HA Pi-hole)
- Build out series for cluster setup
- Integrate with homelab automation for auto-posting
