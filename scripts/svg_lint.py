#!/usr/bin/env python3
"""Deterministic SVG lint for homelab-journal diagram assets.

Failure classes (block deploy):
  1. Arrowhead markers whose triangle tip is drawn along +y while
     orient="auto" rotates the marker x-axis onto the line direction,
     rendering every arrowhead 90 degrees off.
  2. marker references to undefined marker ids.
  3. XML that does not parse.

Warning classes (reported, non-blocking; clean up over time):
  4. Emoji in text labels (render inconsistently across platforms).
  5. Em/en dashes in text labels (house style forbids them).

Pass --strict to treat warnings as failures.
Usage: python3 scripts/svg_lint.py [--strict] [paths...]  (defaults to content/)
Exits nonzero on any failure (or warning, with --strict).
"""
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

NUM = r"[-+]?\d*\.?\d+"
PAIR_RE = re.compile(rf"({NUM})[ ,]+({NUM})")

EMOJI_RANGES = [
    (0x1F000, 0x1FAFF),
    (0x2600, 0x27BF),
    (0x2B00, 0x2BFF),
    (0xFE0F, 0xFE0F),
]
DASHES = {0x2014, 0x2013}


def is_emoji(ch: str) -> bool:
    cp = ord(ch)
    return any(lo <= cp <= hi for lo, hi in EMOJI_RANGES)


def marker_tip_is_vertical(d: str):
    """True if the triangle tip points along y in marker space.

    Under orient="auto" the marker x-axis aligns with the line, so a
    vertical tip renders perpendicular to the line. Returns None when
    the path is not a recognizable triangle.
    """
    pts = [(float(x), float(y)) for x, y in PAIR_RE.findall(d)]
    if len(pts) != 3:
        return None
    cx = sum(p[0] for p in pts) / 3
    cy = sum(p[1] for p in pts) / 3
    tip = max(pts, key=lambda p: (p[0] - cx) ** 2 + (p[1] - cy) ** 2)
    dx, dy = abs(tip[0] - cx), abs(tip[1] - cy)
    if abs(dx - dy) < 0.5:
        return None
    return dy > dx


def lint_file(path: Path):
    fails, warns = [], []
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as e:
        return [f"{path}: XML parse error: {e}"], []

    ns = "" if not root.tag.startswith("{") else root.tag.split("}")[0] + "}"
    marker_ids = set()
    for m in root.iter(f"{ns}marker"):
        mid = m.get("id")
        if mid:
            marker_ids.add(mid)
        orient = m.get("orient", "")
        for p in m.iter(f"{ns}path"):
            if marker_tip_is_vertical(p.get("d", "")) and orient.startswith("auto"):
                fails.append(
                    f"{path}: marker '{mid}' tip points along +y with "
                    f"orient='{orient}': arrowheads render 90 degrees off"
                )

    for el in root.iter():
        tag = el.tag.replace(ns, "")
        if tag in ("line", "path"):
            for attr in ("marker-end", "marker-start", "marker-mid"):
                ref = el.get(attr, "")
                if ref.startswith("url(#") and ref.endswith(")"):
                    if ref[5:-1] not in marker_ids:
                        fails.append(f"{path}: {tag} references undefined marker {ref}")
        if tag == "text":
            text = "".join(el.itertext())
            if any(is_emoji(ch) for ch in text):
                warns.append(f"{path}: emoji in text label: {text!r}")
            if any(ord(ch) in DASHES for ch in text):
                warns.append(f"{path}: em/en dash in text label: {text!r}")
    return fails, warns


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--strict"]
    strict = "--strict" in sys.argv[1:]
    args = args or ["content"]
    files = []
    for a in args:
        p = Path(a)
        files.extend(p.rglob("*.svg") if p.is_dir() else [p])
    all_fails, all_warns = [], []
    for f in sorted(files):
        fails, warns = lint_file(f)
        all_fails.extend(fails)
        all_warns.extend(warns)
    for i in all_fails:
        print(f"FAIL {i}")
    for i in all_warns:
        print(f"WARN {i}")
    blocking = all_fails + (all_warns if strict else [])
    print(
        f"{len(files)} SVGs checked, {len(all_fails)} failure(s), "
        f"{len(all_warns)} warning(s){' (strict mode)' if strict else ''}"
    )
    return 1 if blocking else 0


if __name__ == "__main__":
    sys.exit(main())
