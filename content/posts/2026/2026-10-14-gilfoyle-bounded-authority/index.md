---
title: "Gilfoyle Got Boundaries. His Chats Needed the Memo."
date: 2026-10-14T19:00:00-07:00
lastmod: 2026-10-15
draft: false
tags: ["lesson-learned", "architecture"]
topics: ["ai-tooling", "automation", "security"]
difficulties: ["intermediate"]
description: &excerpt "Giving my AI admin narrower authority exposed a second problem: saving a policy file does not automatically update existing conversations."
summary: *excerpt
showTableOfContents: true
---

I expected changing my AI admin's rules to take three steps: save the policy, deploy it, and restart the gateway. Then I traced how the gateway restores an existing conversation. It can reuse the prompt it saved earlier, leaving Gilfoyle with outdated management instructions. Very on brand.

When I [introduced Gilfoyle in April]({{< relref "/posts/2026/gilfoyle-ai-network-admin" >}}), he was an observer. He watched services, investigated alerts, and told me what broke. By October, his policy carried an Admin label. I had to decide what that label allowed, then check which conversations actually loaded the rules.

## The badge was too vague

“Admin” describes access. It does not tell an assistant whether restarting a service is acceptable while somebody else is working on it, whether a rollback is feasible, or whether the apparently local problem affects shared storage.

I kept Gilfoyle as the independent production incident owner and narrowed the unattended repair ceiling: **one identified service, a known feasible rollback, and verification tied to the original fault**. Broader changes need fresh approval where the policy permits them. That includes hosts, networking, high availability, storage, multi-service changes, irreversible actions, uncertain impact, and work that could interrupt another active session. Permanent deletion bans still apply, even with approval.

I chose that boundary because asking for every diagnostic wastes time, while treating technical access as blanket permission creates problems faster than monitoring can find them.

![Gilfoyle's diagnostic authority, repair ceiling and separately gated execution path](authority-flow.svg)

The deterministic remediation controller is the sole executor and action-ledger writer for eligible autonomy runbooks. A listing in the registry is only one requirement. **The controller remains inactive.** Installing the narrower policy left repairs, credentials, and schedules as they were. With the controller off, Gilfoyle can investigate, report, and recommend. The shell and API cannot substitute for the controller.

These instructions define behavior. They are not a claim of operating-system isolation or proof that every possible action is technically blocked.

## Two failed fixes still means two

An incident also needs continuity. If Gilfoyle investigates a fault and hands evidence to another assistant, the same incident must retain its attempted actions, results, rollback evidence, and attempt count.

The second failed fix freezes that incident and brings me back in. Switching assistants does not buy another two attempts. Otherwise, delegation becomes a loyalty program for repeated mistakes.

Missing or conflicting history means diagnosis only. This is an operating rule carried through the incident record, not a new atomic coordination system across machines.

## The file changed. The conversation did not.

On October 14, I deployed the committed policy, kept a copy of the previous version, and restarted the gateway. I could see the new file on disk and the process running. I still had to check what the conversations loaded.

The runtime restores an existing conversation's stored system prompt when its runtime identity still matches. Changing the policy file alone does not invalidate that identity. **A warm conversation can therefore keep the earlier policy**, even after a gateway restart. A new session, identity change, capability rebuild, or compression can refresh it.

![A deployed policy reaches fresh sessions while existing sessions can retain their stored prompts](session-adoption.svg)

I checked a fresh turn through the real Discord route. Its persisted system prompt contained the exact deployed authority block and permanent hard rules. I left existing conversations alone, so my evidence covers the fresh session.

![Read-only verification of the deployed policy, stored fresh-session prompt and inactive controller](policy-verification.png)

I could inspect the stored prompt without sending another message or triggering a repair. The matching text confirms that the session loaded the policy. Future decisions need evidence that Gilfoyle followed the policy.

## What I would check next time

There are three separate questions: did the configuration reach disk, did the running process see it, and did the session actually load it?

I used to treat those as one deployment check. They are separate acceptance gates, and a green answer to the first two can hide an old prompt behind the third.

Next time, I'll check the stored prompt before calling the rollout done. I'll also keep repair authority specific and make sure failed attempts follow the incident across handoffs.

Gilfoyle still gets to be paranoid. Now the paperwork is more precise.

For the earlier incident story, see [how a certificate flap became a VPN automation project]({{< relref "/posts/2026/gilfoyle-vpn-cert-automation" >}}).

For the complete system around those guardrails, see [How Gilfoyle Works]({{< relref "/posts/2026/2026-10-15-how-gilfoyle-works" >}}): alert intake, investigations, tools, context, memory, and scheduling.
