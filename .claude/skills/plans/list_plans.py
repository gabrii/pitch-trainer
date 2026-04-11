#!/usr/bin/env python3
"""List all plans grouped by status, sorted by modification date (descending)."""

import os
import re
import sys
from pathlib import Path
from datetime import datetime

PLANS_DIR = Path(os.environ.get("PLANS_DIR", "plans"))
STATUS_ORDER = ["DOING", "TODO", "BACKLOG", "DONE"]


def parse_frontmatter(path: Path) -> dict | None:
    """Parse YAML frontmatter from a markdown file. Returns dict or None."""
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return None

    match = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return None

    fm = {}
    for line in match.group(1).splitlines():
        m = re.match(r"^(\w[\w-]*):\s*(.+)$", line)
        if m:
            fm[m.group(1).strip()] = m.group(2).strip().strip('"').strip("'")
    return fm


def main():
    if not PLANS_DIR.is_dir():
        print("No plans/ directory found.")
        return

    plans = []
    for f in sorted(PLANS_DIR.glob("*.md")):
        fm = parse_frontmatter(f)
        if fm is None:
            continue
        mtime = f.stat().st_mtime
        plans.append({
            "file": f.name,
            "path": str(f),
            "name": fm.get("name", f.stem),
            "status": fm.get("status", "BACKLOG").upper(),
            "description": fm.get("description", ""),
            "mtime": mtime,
            "mtime_str": datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M"),
        })

    if not plans:
        print("No plans found in plans/.")
        return

    # Group by status
    grouped: dict[str, list] = {s: [] for s in STATUS_ORDER}
    for p in plans:
        status = p["status"] if p["status"] in STATUS_ORDER else "BACKLOG"
        grouped[status].append(p)

    # Sort each group by mtime descending
    for status in STATUS_ORDER:
        grouped[status].sort(key=lambda p: p["mtime"], reverse=True)

    # Print
    total = len(plans)
    counts = {s: len(grouped[s]) for s in STATUS_ORDER}
    print(f"*{total} plan(s): {counts['DOING']} doing, {counts['TODO']} todo, {counts['BACKLOG']} backlog, {counts['DONE']} done*\n")

    for status in STATUS_ORDER:
        items = grouped[status]
        print(f"### {status}")
        if not items:
            print("*(none)*\n")
            continue
        for p in items:
            desc = f" — {p['description']}" if p['description'] else ""
            print(f"- **{p['name']}** (`{p['path']}`){desc} *({p['mtime_str']})*")
        print()


if __name__ == "__main__":
    main()
