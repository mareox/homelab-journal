---
title: "Moving My UniFi Controller Without Two Controllers Fighting"
date: 2026-09-23T16:25:00-07:00
draft: true
tags: ["lesson-learned"]
topics: ["networking", "proxmox"]
difficulties: ["intermediate"]
description: "A same-IP UniFi controller migration taught me to prove restore paths, fence the old owner, and verify devices rather than trust a green service."
showTableOfContents: true
---

The standalone UniFi Network Application is end of life: the release I was running is the last one, and the way forward is UniFi OS Server. That meant moving my controller. Trivial, until you remember every access point and switch checks in with exactly one address. Move it wrong and you get the worst kind of maintenance window: two controllers that both believe they own the same devices, or nothing reachable at the address all the hardware expects.

Here is how the move actually went, including the part where SSH tried to save me from myself.

## The Host-Key Warning

Mid-migration, an SSH connection to the controller's address threw the warning every engineer dreads: the remote host key had changed. Seen unexpectedly, that message means possible machine substitution. Seen because you deliberately stood a new machine up at an old address, it means your migration is working exactly as designed.

The warning was expected here, and it still caused a false abort: the migration halted on a message that turned out to be benign. I will not claim a textbook fingerprint verification happened next, because the record does not establish the exact response. What stuck with me is the part worth keeping: **a reused address makes host-key warnings ambiguous, and ambiguity should be resolved out of band**, through the hypervisor console or another independent path, never by silencing the check that fired.

## One IP, One Controller

The core risk in any controller move is split brain: two consoles answering for the same devices. So the sequence enforced one owner at a time, and every handoff carried a proof.

First, the new UniFi OS Server was built and its backup restored **while it was still isolated from the production device subnets**. The new console could not collect device check-ins yet, so adoption theft was structurally impossible, not just unlikely.

Second, recoverability was proven in both directions before anything touched production. The old controller's backup was restored to a scratch instance and the service was verified to come up cleanly; the new server's backup got the same isolated restore treatment. If the migration went sideways later, I already knew the restore path worked, because I had watched it work while the stakes were zero.

Third, the cutover. The old controller was fenced: stopped, boot disabled, and its address confirmed silent from more than one vantage point, with an explicit abort condition if it answered anywhere. Only then did the restored server take the address, and the handoff was verified as single ownership at the network layer: exactly one machine answering, no ambiguity about who owns the address.

Finally, device isolation was lifted and the hardware was allowed to find its new home.

![Flow diagram of the same-IP UniFi controller cutover: the old controller is fenced and its address release verified, the restored UniFi OS Server becomes the single owner of the address, device isolation is lifted, and four devices come online with telemetry verified; recovery relies on a verified backup, never an exercised rollback](cutover-flow.svg)

## What Actually Proved It Worked

Not the service status light. All four devices came online about two minutes after isolation lifted. The poller was repointed and produced fresh CPU, memory, and uptime series for all four identities, which is a much stronger signal than a green icon: it proves the new console is actually managing the hardware.

A human browser pass was recorded: login, dashboard, and the device list all confirmed, cross-checked by an independent browser render and authenticated API reads from both the direct and the proxied path. Devices forwarded traffic throughout; the data plane never noticed the management plane changing underneath it.

One decision deserves daylight. I had planned a seven-day soak before retiring the old controller, and the owner explicitly waived it. Disposal proceeded on the strength of a verified known-good backup as the recovery path: the devices re-adopted cleanly after the final renumbering (a couple of them passed through a brief adopting state), and a fresh backup was confirmed green before the fallback machine was destroyed. The rollback plan was proven restorable, not executed. I never had to find out what rollback day would have felt like.

> Visual proof pending: a sanitized current dashboard screenshot would show post-cutover state, not the cutover moment.

## What I Would Repeat

- **Prove restore paths before you need them.** A backup you have never restored is a hope, not a recovery plan.
- **Fence the old owner first, then verify the handoff.** Confirm the address is released before the new owner takes it, and confirm exactly one owner afterward. Handoffs, not overlaps.
- **Resolve reused-address host-key warnings out of band.** The warning was right to fire; the answer is independent identity verification, never disabling the check.
- **Verify devices and telemetry, not service state.** Four online devices with fresh metrics is evidence. A green service icon is decoration.
- **Put the waiver on the record.** The soak was skipped by explicit decision with an accepted recovery path, not by drift or optimism.
