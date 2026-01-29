---
title: "Semaphore Proxmox Power Management Automation"
date: 2026-01-25
tags: ["journal", "automation"]
topics: ["semaphore", "proxmox", "ansible", "power-management"]
---

## What Changed

Added Ansible playbooks to Semaphore for automated Proxmox cluster power management:
- **Night Sleep**: Gracefully shuts down non-essential VMs/LXCs at night
- **Day On**: Wakes up the cluster in the morning
- Scheduled via Semaphore cron

## Why

Running all VMs 24/7 wastes power when they're not needed. Automated scheduling reduces energy costs and wear on hardware.

## Details

- **Service**: Semaphore (Ansible automation)
- **Playbooks**: `night-sleep.yml`, `day-on.yml`
- **API**: Uses centralized Proxmox API host for cluster-wide operations
- **Scheduling**: Semaphore cron with `SEMAPHORE_SCHEDULE_TIMEZONE=America/Los_Angeles`

Important gotcha: Semaphore's cron scheduler ignores the container's `TZ` variable. Must set `SEMAPHORE_SCHEDULE_TIMEZONE` explicitly or schedules run in UTC.

## Result

Non-essential services now sleep from 11 PM to 7 AM Pacific. Essential services (DNS, reverse proxy, backups) remain running.
