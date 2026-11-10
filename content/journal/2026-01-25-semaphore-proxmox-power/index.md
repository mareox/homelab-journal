---
title: "Semaphore Proxmox Power Management Automation"
date: 2026-01-25
tags: ["journal", "automation"]
topics: ["semaphore", "proxmox", "ansible", "power-management"]
description: "Semaphore shuts down nonessential Proxmox guests at night and starts them in the morning. The cron timezone was the catch."
---

## What Changed

I didn't need every VM running overnight. I added two Ansible playbooks in Semaphore to shut down nonessential VMs and LXC containers gracefully, then start them again in the morning. That cuts power use and wear on the hardware.

## Details

Semaphore runs `night-sleep.yml` and `day-on.yml` on a cron schedule. Both use a central Proxmox API host for cluster-wide operations.

The scheduler has its own time zone. It ignores the container's `TZ` setting, so I set `SEMAPHORE_SCHEDULE_TIMEZONE=America/Los_Angeles`. Without it, the jobs run in UTC.

## Result

Nonessential services sleep from 11 PM to 7 AM Pacific. DNS, the reverse proxy, and backups keep running.

![Semaphore Power Management Dashboard](semaphore-power-dashboard.png)

*The Semaphore dashboard shows several weeks of successful shutdown and startup runs.*
