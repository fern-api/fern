#!/usr/bin/env python3
"""
One-time migration script: Convert seed fixtures from full-output-per-variant
to diff-based storage (baseline/ + custom-configs/*.diff).

For each fixture:
1. If no-custom-config/ exists on disk, rename it to baseline/
2. For each other variant directory, compute a diff against baseline/
3. Store the diff in custom-configs/<variant>.diff
4. Remove the old variant directory

Fixtures without a no-custom-config/ directory are skipped (they'll get
a baseline on the next `seed test` run).

Usage:
    python3 scripts/migrate-seed-to-diff-storage.py          # dry run
    python3 scripts/migrate-seed-to-diff-storage.py --apply   # apply changes
"""

import os
import sys
import glob
import shutil
import subprocess
from pathlib import Path

DRY_RUN = "--apply" not in sys.argv
SEED_ROOT = Path(__file__).parent.parent / "seed"


def normalize_diff_paths(diff_content: str, baseline_dir: str, variant_dir: str) -> str:
    """
    Normalize absolute paths in a git diff to use relative a/ and b/ prefixes.
    Same logic as diffStorage.ts normalizeDiffPaths.
    """
    import re

    baseline_prefix = baseline_dir.lstrip("/")
    variant_prefix = variant_dir.lstrip("/")

    baseline_escaped = re.escape(baseline_prefix)
    variant_escaped = re.escape(variant_prefix)

    normalized = diff_content
    # For modified files: a/ uses baseline, b/ uses variant.
    # For deleted files (only in baseline): BOTH sides use baseline path.
    # For new files (only in variant): BOTH sides use variant path.
    # Must handle all four combinations.
    normalized = re.sub(f"a/{baseline_escaped}/", "a/", normalized)
    normalized = re.sub(f"b/{baseline_escaped}/", "b/", normalized)
    normalized = re.sub(f"a/{variant_escaped}/", "a/", normalized)
    normalized = re.sub(f"b/{variant_escaped}/", "b/", normalized)
    return normalized


def compute_diff(baseline_dir: str, variant_dir: str) -> str:
    """Compute a normalized unified diff between two directories."""
    try:
        result = subprocess.run(
            ["git", "diff", "--no-index", "--binary", "--no-color", "--", baseline_dir, variant_dir],
            capture_output=True,
            text=True,
        )
        # Exit code 0 = identical, 1 = differences, >1 = error
        if result.returncode == 0:
            return ""
        elif result.returncode == 1:
            raw_diff = result.stdout
        else:
            print(f"  ERROR: git diff failed (exit {result.returncode}): {result.stderr[:200]}")
            return ""
    except Exception as e:
        print(f"  ERROR: git diff exception: {e}")
        return ""

    if not raw_diff:
        return ""

    return normalize_diff_paths(raw_diff, baseline_dir, variant_dir)


def get_seed_yml_variants(seed_yml_path: str) -> dict:
    """Parse seed.yml and return {fixture_name: [outputFolder, ...]} for fixtures with entries."""
    from ruamel.yaml import YAML
    yaml = YAML()
    yaml.preserve_quotes = True

    with open(seed_yml_path) as f:
        data = yaml.load(f)

    result = {}
    fixtures = data.get("fixtures", {}) or {}
    for fixture_name, entries in fixtures.items():
        if isinstance(entries, list) and len(entries) > 0:
            output_folders = [e.get("outputFolder") for e in entries if e.get("outputFolder")]
            result[fixture_name] = output_folders
    return result


def main():
    if DRY_RUN:
        print("=== DRY RUN (pass --apply to execute) ===\n")

    total_baselines = 0
    total_diffs = 0
    total_removed = 0
    total_skipped = 0

    for seed_yml in sorted(glob.glob(str(SEED_ROOT / "*/seed.yml"))):
        gen_dir = os.path.dirname(seed_yml)
        gen_name = os.path.basename(gen_dir)
        seed_yml_variants = get_seed_yml_variants(seed_yml)

        # Find ALL fixture directories in this generator
        fixture_dirs = sorted(
            d for d in os.listdir(gen_dir)
            if os.path.isdir(os.path.join(gen_dir, d))
            and d not in ("node_modules", ".git")
            and d != "seed.yml"
        )

        gen_baselines = 0
        gen_diffs = 0
        gen_removed = 0
        gen_skipped = 0

        for fixture_name in fixture_dirs:
            fixture_path = os.path.join(gen_dir, fixture_name)
            ncc_path = os.path.join(fixture_path, "no-custom-config")
            baseline_path = os.path.join(fixture_path, "baseline")
            custom_configs_path = os.path.join(fixture_path, "custom-configs")

            # Skip if already migrated
            if os.path.isdir(baseline_path):
                continue

            # Skip if no no-custom-config/ directory
            if not os.path.isdir(ncc_path):
                continue

            # Get variant dirs from seed.yml (if any)
            seed_variants = seed_yml_variants.get(fixture_name, [])

            # Find actual variant subdirectories on disk (excluding no-custom-config and non-variant dirs)
            all_subdirs = sorted(
                d for d in os.listdir(fixture_path)
                if os.path.isdir(os.path.join(fixture_path, d))
                and d not in (".fern", "no-custom-config", "baseline", "custom-configs")
            )

            # Only consider subdirs that are known variants from seed.yml
            # (to avoid treating generated output dirs like .github/ or src/ as variants)
            if seed_variants:
                variant_dirs = [d for d in all_subdirs if d in seed_variants]
            else:
                variant_dirs = []

            # Step 1: Rename no-custom-config/ -> baseline/
            print(f"  {gen_name}/{fixture_name}: rename no-custom-config/ -> baseline/")
            if not DRY_RUN:
                os.rename(ncc_path, baseline_path)
            gen_baselines += 1

            # Step 2: Compute diffs for variant dirs
            for variant_name in variant_dirs:
                variant_path = os.path.join(fixture_path, variant_name)
                if not os.path.isdir(variant_path):
                    gen_skipped += 1
                    continue

                actual_baseline = baseline_path if not DRY_RUN else ncc_path
                diff_content = compute_diff(actual_baseline, variant_path)
                diff_file = os.path.join(custom_configs_path, f"{variant_name}.diff")

                diff_size = len(diff_content.encode("utf-8"))
                variant_size = sum(
                    os.path.getsize(os.path.join(dp, f))
                    for dp, dn, filenames in os.walk(variant_path)
                    for f in filenames
                )
                savings_pct = (1 - diff_size / variant_size) * 100 if variant_size > 0 else 0

                print(f"    diff {variant_name}: {variant_size:,}B -> {diff_size:,}B ({savings_pct:.0f}% savings)")

                if not DRY_RUN:
                    os.makedirs(custom_configs_path, exist_ok=True)
                    with open(diff_file, "w") as f:
                        f.write(diff_content)

                    # Remove old variant directory
                    shutil.rmtree(variant_path)
                    gen_removed += 1

                gen_diffs += 1

        if gen_baselines > 0 or gen_diffs > 0:
            print(f"  [{gen_name}] {gen_baselines} baselines, {gen_diffs} diffs, {gen_removed} dirs removed\n")

        total_baselines += gen_baselines
        total_diffs += gen_diffs
        total_removed += gen_removed
        total_skipped += gen_skipped

    print(f"\n{'DRY RUN ' if DRY_RUN else ''}TOTAL: {total_baselines} baselines created, "
          f"{total_diffs} diffs computed, {total_removed} variant dirs removed, "
          f"{total_skipped} skipped")


if __name__ == "__main__":
    main()
