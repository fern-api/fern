#!/usr/bin/env bash
# sync-sdk.sh — deterministic sync of fern-api/cli-sdk into generators/cli/sdk/
#
# Usage:
#   generators/cli/scripts/sync-sdk.sh <path-to-cli-sdk-checkout>
#
# The script expects a local checkout of cli-sdk (at the desired ref) as its
# sole argument. It reads cli-sdk's sync-manifest.toml to determine which
# files to vendor, projects the workspace Cargo.toml into a single-package
# vendored Cargo.toml, regenerates Cargo.lock, and writes a provenance
# marker.
#
# Called by .github/workflows/sync-cli-sdk.yml (daily) and can be run
# manually for ad-hoc syncs.
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <path-to-cli-sdk-checkout>" >&2
  exit 1
fi

CLI_SDK_DIR="$(cd "$1" && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_DIR="$(cd "$SCRIPT_DIR/../sdk" && pwd)"
MANIFEST="$CLI_SDK_DIR/sync-manifest.toml"

if [[ ! -f "$CLI_SDK_DIR/Cargo.toml" ]]; then
  echo "Error: $CLI_SDK_DIR/Cargo.toml not found" >&2
  exit 1
fi

if [[ ! -f "$MANIFEST" ]]; then
  echo "Error: $MANIFEST not found — cli-sdk must have a sync-manifest.toml" >&2
  exit 1
fi

CLI_SDK_SHA="$(git -C "$CLI_SDK_DIR" rev-parse HEAD 2>/dev/null || echo "unknown")"
CLI_SDK_SHORT="$(git -C "$CLI_SDK_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")"
SYNC_DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "==> Syncing cli-sdk@${CLI_SDK_SHORT} (${CLI_SDK_SHA}) into generators/cli/sdk/"

# ---------------------------------------------------------------------------
# 0. Read the sync manifest
# ---------------------------------------------------------------------------
echo "--- Reading sync-manifest.toml ..."
MANIFEST_JSON="$(python3 "$SCRIPT_DIR/read-manifest.py" "$MANIFEST")"

# Helper: check if a glob pattern appears in a manifest category.
manifest_has_glob() {
  local category="$1" glob="$2"
  echo "$MANIFEST_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for entry in data.get('$category', []):
    if '$glob' in entry.get('globs', []):
        sys.exit(0)
sys.exit(1)
"
}

# Helper: get the dest override for a glob, or empty string.
manifest_dest() {
  local category="$1" glob="$2"
  echo "$MANIFEST_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for entry in data.get('$category', []):
    if '$glob' in entry.get('globs', []):
        print(entry.get('dest', ''))
        sys.exit(0)
print('')
"
}

# ---------------------------------------------------------------------------
# 1. Manifest-driven file sync
# ---------------------------------------------------------------------------
# The manifest classifies cli-sdk files as ship/dev-only/templatized/not-synced.
# We sync everything classified as ship or dev-only. Templatized files
# (Cargo.toml, Cargo.lock) get special projection handling in step 2.

echo "--- Syncing files per manifest ..."

# 1a. src/ — the core library (ship) + strip_schema.rs (dev-only, a file in
# src/bin/ that survives the directory filter). All src/bin/*/ directories
# are not-synced except openapi-fixture which has a dest override.
rsync -a --delete \
  --exclude='.DS_Store' \
  --filter='- bin/*/' \
  "$CLI_SDK_DIR/src/" "$SDK_DIR/src/"

# 1b. Sync entries with dest overrides (e.g. openapi-fixture).
# Parse manifest for dev-only entries with a dest field.
echo "$MANIFEST_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for entry in data.get('dev_only', []):
    dest = entry.get('dest', '')
    if dest:
        for g in entry.get('globs', []):
            # Convert glob to source directory: src/bin/openapi-fixture/** -> src/bin/openapi-fixture/
            src = g.rstrip('*').rstrip('/')
            print(f'{src}|{dest}')
" | while IFS='|' read -r src dest; do
  echo "    rsync $src/ → $dest/"
  mkdir -p "$SDK_DIR/$dest"
  rsync -a --delete \
    "$CLI_SDK_DIR/$src/" "$SDK_DIR/$dest/"
done

# 1c. Sync individual ship files (non-src, non-templatized).
echo "$MANIFEST_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for entry in data.get('ship', []):
    for g in entry.get('globs', []):
        # Skip directory globs (src/**) — handled by rsync above
        if g.startswith('src/') or '**' in g:
            continue
        print(g)
" | while read -r filepath; do
  if [[ -f "$CLI_SDK_DIR/$filepath" ]]; then
    echo "    copy $filepath"
    cp "$CLI_SDK_DIR/$filepath" "$SDK_DIR/$filepath"
  fi
done

# 1d. Sync dev-only files and directories (no dest override).
echo "$MANIFEST_JSON" | python3 -c "
import json, sys
data = json.load(sys.stdin)
for entry in data.get('dev_only', []):
    if entry.get('dest'):
        continue  # handled in 1b
    for g in entry.get('globs', []):
        # Skip things inside src/ — handled by 1a rsync
        if g.startswith('src/'):
            continue
        print(g)
" | while read -r glob; do
  if [[ "$glob" == *"/**" ]]; then
    # Directory glob: rsync the directory
    dir="${glob%/**}"
    if [[ -d "$CLI_SDK_DIR/$dir" ]]; then
      echo "    rsync $dir/"
      mkdir -p "$SDK_DIR/$dir"
      rsync -a --delete "$CLI_SDK_DIR/$dir/" "$SDK_DIR/$dir/"
    fi
  else
    # Single file
    if [[ -f "$CLI_SDK_DIR/$glob" ]]; then
      echo "    copy $glob"
      dir="$(dirname "$glob")"
      [[ "$dir" != "." ]] && mkdir -p "$SDK_DIR/$dir"
      cp "$CLI_SDK_DIR/$glob" "$SDK_DIR/$glob"
    fi
  fi
done

# Remove stale tests/ directory if present from a prior sync revision
if [[ -d "$SDK_DIR/tests" ]]; then
  echo "--- Removing stale tests/ directory ..."
  rm -rf "$SDK_DIR/tests"
fi

# ---------------------------------------------------------------------------
# 1e. Strip fixture-dependent inline tests from src/
# ---------------------------------------------------------------------------
# cli-sdk's #[cfg(test)] modules reference fixture specs via
# include_str!("../bin/<dir>/...") (or the legacy "../../cli/<dir>/...")
# that are NOT synced. Removing them keeps `cargo test` clean in both
# the vendored SDK and generated CLIs.
echo "--- Stripping fixture-dependent inline tests from src/ ..."
python3 "$SCRIPT_DIR/strip-fixture-tests.py" "$SDK_DIR/src/"

# ---------------------------------------------------------------------------
# 2. Project Cargo.toml (not a naive copy — workspace → single-package)
# ---------------------------------------------------------------------------
# This projection is part of Fern's generator contract: the vendored SDK
# must be a single-package crate with specific [[bin]] entries and comment
# anchors that patchCargoToml.ts depends on. cli-sdk does NOT need to know
# about this projection — the manifest just classifies Cargo.toml as
# "templatized".
echo "--- Projecting Cargo.toml ..."

# Helper: extract all lines between a TOML [section] header and the next header.
extract_section() {
  local file="$1" section="$2"
  awk -v sect="$section" '
    BEGIN { found=0 }
    /^\[/ {
      if (found) exit
      # Match the section header exactly
      gsub(/^[[:space:]]+|[[:space:]]+$/, "")
      if ($0 == "[" sect "]") { found=1; next }
    }
    found { print }
  ' "$file"
}

# Extract the workspace version from cli-sdk
WORKSPACE_VERSION="$(extract_section "$CLI_SDK_DIR/Cargo.toml" "workspace.package" \
  | grep '^version' | sed 's/.*"\(.*\)".*/\1/')"

if [[ -z "$WORKSPACE_VERSION" ]]; then
  echo "Error: could not extract [workspace.package] version from cli-sdk" >&2
  exit 1
fi

echo "    version: $WORKSPACE_VERSION"

FEATURES_BODY="$(extract_section "$CLI_SDK_DIR/Cargo.toml" "features")"
DEPS_BODY="$(extract_section "$CLI_SDK_DIR/Cargo.toml" "dependencies")"
BUILD_DEPS_BODY="$(extract_section "$CLI_SDK_DIR/Cargo.toml" "build-dependencies")"
DEV_DEPS_BODY="$(extract_section "$CLI_SDK_DIR/Cargo.toml" "dev-dependencies")"
PROFILE_DIST_BODY="$(extract_section "$CLI_SDK_DIR/Cargo.toml" "profile.dist")"
METADATA_DIST_BODY="$(extract_section "$CLI_SDK_DIR/Cargo.toml" "package.metadata.dist")"

# Build the projected Cargo.toml with Fern comment blocks intact
cat > "$SDK_DIR/Cargo.toml" << 'CARGO_HEADER'
# `name`, `repository`, `homepage`, `authors`, and `keywords` are Fern's —
# they identify the SDK template's source on crates.io. The fern-cli
# generator does NOT rewrite this block when producing your CLI; only the
# [[bin]] entry below is templated. If you want to publish *your* CLI as
# its own crate on crates.io, edit this block to your org's metadata.
# The [lib] name (`fern_cli_sdk`) is the import path every `use
# fern_cli_sdk::...` site in src/ depends on — do NOT rename it.
[package]
name = "fern-cli-sdk"
CARGO_HEADER

cat >> "$SDK_DIR/Cargo.toml" << EOF
version = "$WORKSPACE_VERSION"
edition = "2021"
description = "CLI generator — dynamic command surface from OpenAPI and GraphQL schemas"
license = "Apache-2.0"
repository = "https://github.com/fern-api/cli-sdk"
homepage = "https://github.com/fern-api/cli-sdk"
readme = "README.md"
authors = ["Fern <hey@buildwithfern.com>"]
keywords = ["cli", "openapi", "graphql", "fern", "codegen"]
categories = ["command-line-utilities", "web-programming"]

[lib]
name = "fern_cli_sdk"
path = "src/lib.rs"

# Rewritten by the fern-cli generator's \`patchCargoToml\` step — both the
# \`name\` and \`path\` are replaced with the derived binary name so users
# get \`cargo install\`-able binaries named after their API rather than
# the template's literal "openapi-fixture".
[[bin]]
name = "openapi-fixture"
path = "cli/openapi-fixture/main.rs"

# Internal tool used by the SDK template itself — not the user's CLI.
[[bin]]
name = "strip-schema"
path = "src/bin/strip_schema.rs"

[features]
$FEATURES_BODY

[dependencies]
$DEPS_BODY

[package.metadata.dist]
$METADATA_DIST_BODY
[profile.dist]
$PROFILE_DIST_BODY

[build-dependencies]
$BUILD_DEPS_BODY

[dev-dependencies]
$DEV_DEPS_BODY
EOF

# ---------------------------------------------------------------------------
# 3. Provenance marker + manifest-derived artifacts
# ---------------------------------------------------------------------------
echo "--- Writing provenance marker ..."

cat > "$SDK_DIR/.synced-from" << EOF
cli-sdk@${CLI_SDK_SHA}
EOF

# Copy the manifest itself into the vendored tree for reference.
cp "$MANIFEST" "$SDK_DIR/sync-manifest.toml"

# Generate .sdk-ignore.json — the dev-only globs rewritten for the vendored
# tree layout (dest overrides applied). build.mjs reads this to derive
# SDK_IGNORE without needing a TOML parser.
echo "--- Generating .sdk-ignore.json ..."
python3 "$SCRIPT_DIR/read-manifest.py" "$MANIFEST" --sdk-ignore > "$SDK_DIR/.sdk-ignore.json"

# ---------------------------------------------------------------------------
# 4. Regenerate Cargo.lock
# ---------------------------------------------------------------------------
echo "--- Regenerating Cargo.lock ..."
(cd "$SDK_DIR" && cargo generate-lockfile 2>&1) || {
  echo "Warning: cargo generate-lockfile failed; Cargo.lock may be stale" >&2
}

# ---------------------------------------------------------------------------
# 5. Summary
# ---------------------------------------------------------------------------
echo ""
echo "==> Sync complete: cli-sdk@${CLI_SDK_SHORT} → generators/cli/sdk/"
echo "    version: $WORKSPACE_VERSION"
echo "    sha:     $CLI_SDK_SHA"
echo "    date:    $SYNC_DATE"
echo ""
echo "Changed files:"
(cd "$SDK_DIR" && git diff --stat 2>/dev/null || true)
(cd "$SDK_DIR" && git diff --stat --cached 2>/dev/null || true)
echo ""
echo "Untracked files:"
(cd "$SDK_DIR" && git ls-files --others --exclude-standard 2>/dev/null || true)
