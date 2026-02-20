---
title: "Building a Second Brain for Claude Code: OpenClaw-Inspired Personalization"
date: 2026-02-11
draft: true
tags: ["lesson-learned", "ai", "automation"]
topics: ["claude-code", "ai-agents", "productivity"]
difficulty: "intermediate"
cover:
  image: "thumbnail.png"
  alt: "Building a Second Brain for Claude Code"
---

## The Goal

Turn Claude Code from a stateless coding assistant into a **persistent personal assistant** — a second brain that remembers context across sessions, learns from daily work, and can semantically search past knowledge.

Inspired by [OpenClaw](https://openclaw.ai/)'s personalization architecture, adapted for Claude Code's native capabilities.

## OpenClaw's Approach (The Model)

OpenClaw creates personalization through:

| Feature | How It Works |
|---------|-------------|
| **Two-layer memory** | `MEMORY.md` (curated long-term) + `memory/YYYY-MM-DD.md` (daily logs) |
| **Auto memory flush** | Before context compaction, agent writes insights to disk |
| **Hybrid search** | Vector embeddings + keyword search over all memory files |
| **Skills system** | Markdown files as on-demand knowledge that grow over time |
| **Centralized preferences** | Single file for personal prefs |
| **External integrations** | Obsidian vault, health data, communication channels |

## Gap Analysis: Claude Code vs OpenClaw

Claude Code already has ~70% of the infrastructure. The gap is **automation glue**, not features.

| OpenClaw Feature | Claude Code Status | Gap |
|------------------|-------------------|-----|
| Curated MEMORY.md | Exists (first 200 lines auto-loaded) | LOW - needs restructuring |
| Daily logs | **Missing entirely** | HIGH |
| Pre-compaction flush | Hook system exists, not configured | HIGH |
| Vector/semantic search | No MCP server for this | HIGH |
| Centralized preferences | Split across 3+ config files | MEDIUM |
| Skills that learn | Skills exist but static | MEDIUM |
| Notepad wisdom | Infrastructure exists, unused | LOW |

## Architecture

```text
LAYER 1: CURATED MEMORY (auto-loaded every session)
└── ~/.claude/MEMORY.md (first 200 lines)
    ├── Identity & Preferences
    ├── Active Projects
    ├── Patterns & Decisions
    └── Recent Context (rotated weekly)

LAYER 2: DAILY CHRONICLE (hook-automated)
└── ~/.claude/memory/YYYY-MM-DD.md
    ├── Session summaries
    ├── Decisions made
    ├── Problems encountered
    └── Follow-ups needed
    Hooks: PreCompact → flush, SessionStop → summarize

LAYER 3: SEARCHABLE KNOWLEDGE (MCP server)
└── ChromaDB + bge-small-en-v1.5
    ├── Indexes all memory/*.md files
    ├── Semantic vector search (cosine similarity)
    └── Nightly re-index via cron

LAYER 4: LIVING SKILLS (on-demand)
└── /recall, /journal, /reflect skills
    ├── Search memory corpus
    ├── Create structured daily entries
    └── Weekly synthesis + promotion to MEMORY.md
```

## Implementation Plan

### Phase 1: Quick Wins (1-2 hours)

- [x] **Restructure MEMORY.md** — Curated 200-line template with sections: Identity, Active Projects, Preferences, Architectural Decisions, Patterns Learned, Recent Context
- [x] **Create PREFERENCES.md** — Centralized personal preferences (communication style, tech choices, work habits)
- [x] **Create daily log system** — `~/.claude/memory/` directory with `.template.md`
- [x] **Create PreCompact hook** — `memory-flush.sh` writes context to daily log before compaction
- [x] **Create SessionStart hook** — `session-start-memory.sh` loads today's log + yesterday's follow-ups
- [x] **Create SessionEnd hook** — `session-summary.sh` appends session boundary to daily log
- [x] **Configure hooks** — Merge into `settings.local.json`
- [x] **Activate OMC notepad** — Add reminder to use `addLearning()`, `addDecision()` during planning

### Phase 2: Enhanced Memory (3-4 hours)

- [x] **Weekly reflection script** — `weekly-reflect.sh` synthesizes 7 days, flags promotion candidates (cron Sunday 9pm)
- [x] **Memory cleanup script** — `memory-cleanup.sh` archives logs >30 days as .gz (cron monthly)
- [x] **Create `/recall` skill** — Search across all memory files (daily logs, weekly syntheses, project memories)
- [x] **Create `/journal` skill** — Structured daily entry creation with type classification
- [x] **Create `/reflect` skill** — Weekly review and promotion to MEMORY.md (keeps under 200 lines)
- [x] **Set up cron jobs** — Weekly reflection + monthly cleanup + nightly reindex

### Phase 3: Vector Search Brain (4-6 hours)

- [x] **Build ChromaDB MCP server** — Python MCP service with bge-small-en-v1.5 embeddings for semantic search
- [x] **Register MCP server** — Added to `~/GIT/.mcp.json` (workspace-level)
- [x] **Set up nightly reindex** — Cron job at 11pm Pacific to keep vectors fresh
- [ ] **Optional: Obsidian bridge** — Add vault path to indexer for personal notes

## Approach Comparison

| Dimension | Pure Native | Plugin-Enhanced | **Full Hybrid (Chosen)** |
|-----------|-------------|-----------------|--------------------------|
| Complexity | Low | Medium | Medium-High |
| Token cost/session | Low | Medium | Low-Medium (on-demand) |
| Search quality | grep only | Varies | **Keyword + semantic** |
| Privacy | 100% local | Some phone home | **100% local** |
| Scales to 1000+ logs | No | Depends | **Yes** |
| Offline capable | Yes | Maybe not | **Yes** |

## Why Full Hybrid?

1. **Phase 1 is zero-risk** — hooks + markdown that make every session smarter, starting immediately
2. **Phase 2 makes it self-sustaining** — weekly synthesis prevents memory rot
3. **Phase 3 is the real unlock** — within 3 months there will be 90+ daily logs; without semantic search, old memories become unfindable

Plugins (Claude-Mem, Supermemory) are designed for users without sophisticated setups. They would conflict with the existing oh-my-claudecode orchestration layer and some require cloud APIs.

## Key Design Decisions

- **ChromaDB over sqlite-vec/Qdrant/Pinecone** — Industry default for local AI apps (25K GitHub stars, used by Claude-Mem plugin). Built-in HNSW index, PersistentClient for on-disk storage, cosine distance. sqlite-vec is lighter but less community support and tooling.
- **bge-small-en-v1.5 over all-MiniLM-L6-v2** — Same 384 dimensions but 62% MTEB score vs 28%. Released 2023 vs 2019. Drop-in replacement with dramatically better retrieval quality.
- **200-line MEMORY.md budget** — Claude Code auto-loads first 200 lines; every line must earn its place
- **Daily logs are append-only** — Never edit past entries, only promote insights upward
- **Weekly reflection is manual** — Script generates candidates, human approves promotions

## Lessons Learned

- OpenClaw's power isn't any single feature — it's the **lifecycle**: capture daily, search semantically, synthesize weekly, promote durably
- Claude Code already has 70% of the infrastructure; the gap is automation glue
- The 200-line MEMORY.md limit is actually a **feature** — forces curation over accumulation
- Hooks (PreCompact, SessionStart, SessionEnd) are the critical integration points — note: `SessionStop` is not a valid hook event, use `SessionEnd`
- Local-first vector search (ChromaDB + bge-small-en-v1.5) beats cloud solutions for privacy and reliability
- Embedding model choice matters: bge-small-en-v1.5 (2023, 62% MTEB) dramatically outperforms all-MiniLM-L6-v2 (2019, 28% MTEB) at the same 384 dimensions
