# Automated Homelab Journal Tracking - Implementation Plan

**Status:** Planning
**Created:** 2026-01-26
**Goal:** Make `/journal` act like a personal assistant-bot that passively tracks homelab-infra changes

---

## Current State

- `/journal` skill exists (`~/.claude/skills/mx-homelab-journal/`)
- It's **manual only** - requires running `/journal` after work
- homelab-journal Hugo site is deployed to GitHub Pages

## Desired State

A hybrid system where:
1. **Automated layer** passively tracks git changes in homelab-infra
2. **Manual layer** (`/journal`) produces polished posts with full context
3. Nothing falls through the cracks

---

## Architecture

```
n8n Workflow (scheduled)
    ├── Daily: Git diff scan → append to changelog-buffer.md
    ├── Weekly: Generate "Week in Review" draft post
    └── Discord: Notify when drafts are ready

/journal skill (on-demand, enhanced)
    ├── Reads changelog-buffer.md for context
    ├── User enriches with narrative/lessons
    └── Produces polished posts

homelab-journal repo
    ├── _drafts/changelog-buffer.md  (auto-generated, gitignored)
    ├── content/posts/week-in-review/ (auto-generated weekly)
    └── content/tutorials|wiki|posts/ (manual via /journal)
```

---

## Implementation Tasks

### Phase 1: n8n Workflow for Git Tracking

- [ ] Create n8n workflow: "Homelab Journal Auto-Tracker"
- [ ] Cron trigger: daily at midnight
- [ ] SSH into homelab-infra server (or read from git remote)
- [ ] Run `git log --since="24 hours ago"` on homelab-infra
- [ ] Parse commits: group by directory (pihole/, graylog/, proxmox/, etc.)
- [ ] Classify significance:
  - **Significant:** 3+ files changed, new directories, config changes, new services
  - **Routine:** Docs-only, minor fixes, formatting
- [ ] Append significant changes to `_drafts/changelog-buffer.md`
- [ ] Discord notification: summary of what was tracked

### Phase 2: Weekly Review Auto-Post

- [ ] n8n workflow: weekly trigger (Sunday evening)
- [ ] Read `_drafts/changelog-buffer.md`
- [ ] Generate "Week in Review" draft post
- [ ] Template:
  ```markdown
  ---
  title: "Week in Review: {date_range}"
  date: {date}
  tags: ["week-in-review"]
  topics: [{auto_detected}]
  draft: true
  ---

  ## What Happened This Week
  {summary_of_changes}

  ## By Topic
  ### {topic_1}
  {changes}

  ### {topic_2}
  {changes}

  ## Stats
  - Commits: {count}
  - Files changed: {count}
  - Areas touched: {list}
  ```
- [ ] Save to `content/posts/{year}/week-in-review-{date}.md`
- [ ] Discord notification: "Weekly review draft ready"

### Phase 3: Enhance /journal Skill

- [ ] Update `/journal` skill to read `_drafts/changelog-buffer.md`
- [ ] Present accumulated context when invoked
- [ ] After generating a post, mark used items in buffer as "posted"
- [ ] Clear buffer items older than 30 days

### Phase 4: Gitignore & Housekeeping

- [ ] Add `_drafts/` to `.gitignore` (buffer is local working state)
- [ ] Or: commit buffer to track history (but mark as draft)
- [ ] Add `_planning/` to `.gitignore` (this file)

---

## Options Considered

### Option 1: Git-Driven Changelog Bot (n8n only)
- Fully automatic, no manual intervention
- Commit messages may lack context
- Good for "Week in Review" posts

### Option 2: Hybrid Auto-Track + Manual Enrich (SELECTED)
- Automated tracking ensures nothing is missed
- `/journal` skill handles polished content
- Changelog buffer bridges both systems
- n8n is already in the stack

### Option 3: Claude Code Post-Commit Hook
- Only works during Claude Code sessions
- Doesn't catch work outside Claude Code
- Still requires manual action

---

## Key Decisions Still Needed

1. **Where does the changelog buffer live?**
   - Option A: `_drafts/changelog-buffer.md` in homelab-journal (gitignored)
   - Option B: Separate tracking file in homelab-infra
   - Option C: n8n workflow stores state internally

2. **How does n8n access homelab-infra git history?**
   - Option A: SSH to a server that has the repo cloned
   - Option B: GitHub API (`gh api repos/mareox/homelab-infra/commits`)
   - Option C: Local git on the machine running n8n

3. **Should "Week in Review" posts auto-publish or stay as drafts?**
   - Recommendation: Stay as `draft: true`, review before publishing

4. **Notification channel?**
   - Discord (existing infrastructure)
   - Or just check the drafts folder periodically

---

## References

- `/journal` skill: `~/.claude/skills/mx-homelab-journal/SKILL.md`
- n8n workflows repo: `~/GIT/n8n-workflows/`
- homelab-journal repo: `~/GIT/homelab-journal/`
- homelab-infra repo: `~/GIT/homelab-infra/`
