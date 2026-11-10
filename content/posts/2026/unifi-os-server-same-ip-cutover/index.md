---
title: "Moving My UniFi Controller Without Two Controllers Fighting"
date: 2026-09-23T16:25:00-07:00
draft: true
tags: ["lesson-learned"]
topics: ["networking", "proxmox"]
difficulties: ["intermediate"]
description: "I moved a UniFi controller to the same IP and learned to test the restore, keep the old controller offline, and check the devices."
showTableOfContents: true
---

The standalone UniFi Network Application was at end of life. The release I was running was the last one, so I needed to move to UniFi OS Server. My access points and switches all checked in at the same address. The move had to leave one controller at that address, without a gap long enough to lose management or an overlap where both controllers could see the devices.

## The Host-Key Warning

During the migration, SSH warned me that the controller's host key had changed. That can mean I reached the wrong machine. In this case I'd deliberately put a new machine at an address that SSH already knew.

The warning stopped the migration even though the key change was expected. The record doesn't show exactly how I responded or whether I checked the fingerprint. Next time I'd verify it independently through the hypervisor console or another trusted path before continuing.

## One IP, One Controller

I kept the device networks isolated from the new controller until I could prove the old one had released the address.

I built the UniFi OS Server and restored its backup while it was isolated from the production device subnets. At that point the devices could only check in with the old controller.

Before touching production, I restored the old controller's backup to a scratch instance and checked that the service started. I did the same isolated restore with the new server's backup. I had already seen both restore paths work before I needed either of them.

I stopped the old controller, disabled boot, and checked from more than one place that its address was quiet. An answer anywhere would have stopped the cutover. Then I assigned the address to the restored server and checked that exactly one machine answered.

Once I confirmed that, I lifted the isolation so the devices could reach the new controller.

![Flow diagram of the same-IP UniFi controller cutover: the old controller is fenced and its address release verified, the restored UniFi OS Server becomes the single owner of the address, device isolation is lifted, and four devices come online with telemetry verified; recovery relies on a verified backup, never an exercised rollback](cutover-flow.svg)

## What Actually Proved It Worked

All four devices came online about two minutes after I lifted isolation. I repointed the poller and saw fresh CPU, memory, and uptime series for all four. That was my evidence that the new controller was managing them.

A browser check confirmed login, the dashboard, and the device list. An independent browser render and authenticated API calls checked the direct and proxied paths. Devices kept forwarding traffic throughout the move.

I'd planned to keep the old controller for seven days. The owner explicitly waived the wait and accepted a verified backup as the recovery path. After the final renumbering, all four devices re-adopted, with a couple briefly showing an adopting state. A fresh backup passed before the fallback machine was destroyed. I'd tested the restore path and never had to roll back.

> Visual proof pending. A sanitized dashboard screenshot would show the post-cutover state.

## What I Would Repeat

- Restore each backup in isolation so you know the service comes up.
- Fence the old controller. Check that the address is quiet before assigning it, then check for exactly one owner afterward.
- When a reused address triggers a host-key warning, confirm the new identity through an independent path. Keep the SSH check enabled.
- Verify the device list and fresh telemetry. A green process status tells you much less.
- Record who waived the soak and which tested recovery path they accepted.
