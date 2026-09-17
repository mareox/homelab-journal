---
title: "AI Tooling"
description: "Claude Code architecture, agent patterns, and AI-assisted workflows"
date: 2026-09-16
tags: ["wiki"]
topics: ["claude-code", "ai-agents", "mcp", "memory", "automation"]
---

![AI Tooling](../../images/banner-ai-tooling.png)

AI-augmented homelab operations, from multi-agent orchestration to automated content pipelines. This wiki documents how Claude Code and agentic patterns accelerate infrastructure work.

## 4-Layer Agentic Architecture

A framework for organizing AI-assisted automation into composable layers:

- [Building a 4-Layer Agentic Architecture for Claude Code]({{< relref "/posts/2026/4-layer-agentic-architecture" >}}): Justfile, Commands, Skills, and Agents, where each layer has a single responsibility

## Skill Development

The Skills layer outgrew a folder of one-off scripts. It is now a curated collection of 60+ skills with a shared prefix: journaling, homelab health checks, code mentoring, adversarial review, and build-plan generation. Skills live in a central configuration repo and deploy to every machine via symlink, so a skill written on the laptop shows up in the homelab session an hour later.

Third-party skills are vendored rather than cloned ad hoc. A vendor script pins versions, records provenance, and runs integrity checks, and a doctor command flags drift before it bites. The transferable lesson: treat skills as packages, not snippets.

## AI-Assisted Blog Pipeline

End-to-end automation from homelab work to published post:

- [Building an Automated Blog Pipeline]({{< relref "/posts/2026/automated-blog-pipeline" >}}): git commit scanning, content generation, Hugo publishing, and Discord notifications

## Unified MCP Server

One integration layer for everything the agents touch:

- [One MCP Server to Rule Them All]({{< relref "/posts/2026/unified-homelab-mcp-server" >}}): one read-only interface over the homelab's services (now 25 tools, local stdio + CLI), replacing six terminal sessions with one question
- [Meet Gilfoyle]({{< relref "/posts/2026/gilfoyle-ai-network-admin" >}}): the same MCP server as the nervous system for a 24/7 AI network admin, with trust levels, scheduled patrols, and a hard lesson about LLMs misreading charts

## Second Brain

Claude Code ships stateless. The Second Brain changes that: daily logs, weekly reflections, project memory, and semantic search over all of it, captured by hooks instead of discipline.

- [Building a Second Brain for Claude Code]({{< relref "/posts/2026/claude-code-second-brain" >}}): Hermes-inspired personalization with auto-flushed memory and hybrid search

## Agent Memory

One session remembering things is step one. The current step is shared memory across agents: a self-hosted Hindsight instance feeds a homelab-ops memory bank that multiple agents read and write, so a decision one agent records on Monday is context another agent has on Friday. The bank holds decisions with owners and rationale, lifecycle state, and incident history. Raw conversations, credentials, and tool arguments stay out by policy.

History import is treated like a pipeline, not a copy button: chat transcripts are normalized, deduplicated against what the bank already holds, and processed under locks so concurrent runs cannot double-ingest.

## Related Pages

- [Automation](../automation/): Infrastructure automation patterns
- [Observability](../observability/): AI-assisted monitoring
