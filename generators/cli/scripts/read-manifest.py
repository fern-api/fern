#!/usr/bin/env python3
"""Read sync-manifest.toml and output structured JSON for sync-sdk.sh.

Usage:
    python3 read-manifest.py <path-to-sync-manifest.toml> [--sdk-ignore]

Without --sdk-ignore: outputs full JSON with all categories and dest overrides.
With --sdk-ignore: outputs a JSON array of globs for dev-only files (for build.mjs).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def parse_manifest(path: Path) -> list[dict]:
    """Parse sync-manifest.toml into a list of rule dicts.

    Minimal TOML parser — handles [[rules]] tables with string and
    string-array values. No dependency on tomllib (3.11+) or third-party
    packages so it works on any CI runner's system Python.
    """
    rules: list[dict] = []
    current: dict | None = None

    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line == "[[rules]]":
            if current is not None:
                rules.append(current)
            current = {}
            continue
        if current is None:
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if value.startswith("["):
            items = value.strip("[]").split(",")
            current[key] = [
                item.strip().strip('"').strip("'") for item in items if item.strip()
            ]
        elif value.startswith('"') or value.startswith("'"):
            current[key] = value.strip('"').strip("'")
        else:
            current[key] = value

    if current is not None:
        rules.append(current)
    return rules


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", help="Path to sync-manifest.toml")
    parser.add_argument(
        "--sdk-ignore",
        action="store_true",
        help="Output only the dev-only globs as a JSON array (for build.mjs)",
    )
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    if not manifest_path.exists():
        print(f"Error: {manifest_path} not found", file=sys.stderr)
        return 1

    rules = parse_manifest(manifest_path)

    if args.sdk_ignore:
        # Collect globs from dev-only rules
        ignore_globs: list[str] = []
        for rule in rules:
            if rule.get("category") == "dev-only":
                for g in rule.get("globs", []):
                    # The openapi-fixture rule has a dest override — the
                    # vendored path differs from the source path. Rewrite
                    # the glob to match the vendored location.
                    dest = rule.get("dest")
                    if dest:
                        # src/bin/openapi-fixture/** → cli/openapi-fixture/**
                        # Strip the source prefix and prepend dest
                        parts = g.split("/")
                        # Find the glob suffix (e.g. "**")
                        suffix = parts[-1] if parts[-1] in ("**", "*") else ""
                        if suffix:
                            ignore_globs.append(f"{dest}/{suffix}")
                        else:
                            ignore_globs.append(dest)
                    else:
                        ignore_globs.append(g)
        json.dump(ignore_globs, sys.stdout, indent=2)
        print()
        return 0

    # Full structured output for sync-sdk.sh
    categories: dict[str, list[dict]] = {
        "ship": [],
        "dev_only": [],
        "templatized": [],
    }
    for rule in rules:
        cat = rule.get("category", "not-synced")
        if cat == "not-synced":
            continue
        key = cat.replace("-", "_")
        entry: dict = {"globs": rule.get("globs", [])}
        if "dest" in rule:
            entry["dest"] = rule["dest"]
        if key in categories:
            categories[key].append(entry)

    json.dump(categories, sys.stdout, indent=2)
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
