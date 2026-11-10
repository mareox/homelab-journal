---
title: "AI Tooling"
description: "Claude Code architecture, agent patterns, and AI-assisted workflows"
date: 2026-09-16
lastmod: 2026-10-15
tags: ["wiki"]
topics: ["claude-code", "ai-agents", "mcp", "memory", "automation"]
---

![A read-only tool session beside a runbook](../../images/banner-ai-tooling.png)

I use Claude Code to speed up infrastructure work. This section covers how I coordinate multiple agents and automate tasks like turning homelab work into blog posts.

## 4-Layer Agentic Architecture

I build AI-assisted workflows in layers so I can reuse parts of one workflow in another.

- [Building a 4-Layer Agentic Architecture for Claude Code]({{< relref "/posts/2026/4-layer-agentic-architecture" >}}): Justfile, Commands, Skills, and Agents, where each layer has a single responsibility

## Skill Development

The Skills layer outgrew a folder of one-off scripts. It now has 60+ skills with a shared prefix, covering everything from journaling and homelab health checks to code mentoring, adversarial review, and build plans. Skills live in a central configuration repo and deploy to every machine via symlink, so a skill written on the laptop shows up in the homelab session an hour later.

I vendor third-party skills. The vendor script pins versions, records where each skill came from, and checks its integrity. A doctor command flags drift before it bites.

## AI-Assisted Blog Pipeline

- [Building an Automated Blog Pipeline]({{< relref "/posts/2026/automated-blog-pipeline" >}}): git commit scanning, content generation, Hugo publishing, and Discord notifications

## Unified MCP Server

- [One MCP Server to Rule Them All]({{< relref "/posts/2026/unified-homelab-mcp-server" >}}): one read-only interface over the homelab's services (now 25 tools, local stdio + CLI), replacing six terminal sessions with one question
- [Meet Gilfoyle]({{< relref "/posts/2026/gilfoyle-ai-network-admin" >}}): the April launch, scheduled patrols, and a hard lesson about LLMs misreading charts, with dated corrections separating the original setup from later policy
- [How Gilfoyle Works]({{< relref "/posts/2026/2026-10-15-how-gilfoyle-works" >}}): the current end-to-end architecture, from Discord intake through tools, memory, scheduling, and repair boundaries
- [Gilfoyle Caught an Expired VPN Cert]({{< relref "/posts/2026/gilfoyle-vpn-cert-automation" >}}): the April incident that led to consolidated certificate automation, with AI monitoring the automation rather than renewing certificates
- [Gilfoyle's Bounded Authority]({{< relref "/posts/2026/2026-10-14-gilfoyle-bounded-authority" >}}): the October 14 Level 4 policy rollout, fresh-session verification, and the difference between loaded policy and an active unattended controller

## Second Brain

I use hooks to save daily logs, weekly reflections, and project memory between Claude Code sessions. Those notes go into the Second Brain, where I can search them by meaning.

- [Building a Second Brain for Claude Code]({{< relref "/posts/2026/claude-code-second-brain" >}}): Hermes-inspired personalization with auto-flushed memory and hybrid search

## Agent Memory

My agents share a homelab-ops memory bank in a self-hosted Hindsight instance. A decision one agent records on Monday is there for another agent to use on Friday. The bank holds decisions with owners and rationale, lifecycle state, and incident history. Raw conversations, credentials, and tool arguments stay out by policy.

The import normalizes chat transcripts and skips anything the bank already holds. Locks keep concurrent runs from importing the same transcript twice.

## Related Pages

- [Automation](../automation/): Infrastructure automation patterns
- [Observability](../observability/): AI-assisted monitoring
