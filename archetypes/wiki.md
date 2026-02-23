---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true
tags: ["reference"]
topics: []
difficulties: ["beginner"]
description: "Reference guide for..."
showTableOfContents: true
---

## What is X?

Brief, clear explanation of the concept or technology.

**Use cases:**
- Use case 1
- Use case 2
- Use case 3

---

## Key Concepts

### Concept 1

Explanation...

### Concept 2

Explanation...

---

## Quick Start

Minimal steps to get started:

```bash
# Installation
apt install package-name

# Basic usage
command --help
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `command -a` | Does thing A |
| `command -b` | Does thing B |
| `command -c` | Does thing C |

---

## Configuration

Key configuration options:

```yaml
# /path/to/config.yaml
setting1: value
setting2: value
```

| Setting | Default | Description |
|---------|---------|-------------|
| setting1 | `value` | What it controls |
| setting2 | `value` | What it controls |

---

## Best Practices

- Best practice 1
- Best practice 2
- Best practice 3

---

## Common Issues

### Issue: Problem description

**Solution:**
```bash
fix-command
```

---

## Related

- [Tutorial: Getting Started](/tutorials/getting-started/)
- [Architecture: System Overview](/architecture/overview/)
- [External: Official Documentation](https://example.com)

---

## Changelog

- **{{ .Date | time.Format "2006-01-02" }}** - Initial version
