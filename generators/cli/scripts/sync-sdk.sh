#!/usr/bin/env bash
# sync-sdk.sh — deterministic sync of fern-api/cli-sdk into generators/cli/sdk/
#
# Usage:
#   generators/cli/scripts/sync-sdk.sh <path-to-cli-sdk-checkout>
#
# The script expects a local checkout of cli-sdk (at the desired ref) as its
# sole argument. It projects the cli-sdk workspace Cargo.toml into the
# single-package vendored Cargo.toml, rsyncs source files, regenerates
# Cargo.lock, and writes a provenance marker.
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

if [[ ! -f "$CLI_SDK_DIR/Cargo.toml" ]]; then
  echo "Error: $CLI_SDK_DIR/Cargo.toml not found" >&2
  exit 1
fi

CLI_SDK_SHA="$(git -C "$CLI_SDK_DIR" rev-parse HEAD 2>/dev/null || echo "unknown")"
CLI_SDK_SHORT="$(git -C "$CLI_SDK_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")"
SYNC_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

echo "==> Syncing cli-sdk@${CLI_SDK_SHORT} (${CLI_SDK_SHA}) into generators/cli/sdk/"

# ---------------------------------------------------------------------------
# 1. Rsync source files with SDK_IGNORE rules (mirrors build.mjs SDK_IGNORE)
# ---------------------------------------------------------------------------
echo "--- Syncing src/, tests/, cli/openapi-fixture/ ..."

rsync -a --delete \
  --exclude='.DS_Store' \
  --exclude='target/' \
  --exclude='.gitignore' \
  --exclude='docs/' \
  --exclude='tests/overlay_fixture.rs' \
  --exclude='tests/fixtures/' \
  --exclude='cli/openapi-fixture/' \
  --exclude='.github/' \
  --exclude='build.rs' \
  --exclude='tests/common/' \
  --exclude='tests/auth_routing_wire.rs' \
  --exclude='tests/extension_surface_behavior.rs' \
  --exclude='tests/lib_api.rs' \
  --exclude='tests/tls_env_vars.rs' \
  --exclude='changes/' \
  "$CLI_SDK_DIR/src/" "$SDK_DIR/src/"

# Sync tests (only the ones not in SDK_IGNORE)
mkdir -p "$SDK_DIR/tests"
rsync -a --delete \
  --exclude='.DS_Store' \
  --exclude='overlay_fixture.rs' \
  --exclude='fixtures/' \
  --exclude='common/' \
  --exclude='auth_routing_wire.rs' \
  --exclude='extension_surface_behavior.rs' \
  --exclude='lib_api.rs' \
  --exclude='tls_env_vars.rs' \
  "$CLI_SDK_DIR/tests/" "$SDK_DIR/tests/"

# Sync cli/openapi-fixture/ (the dev fixture used by seed)
mkdir -p "$SDK_DIR/cli/openapi-fixture"
rsync -a --delete \
  "$CLI_SDK_DIR/cli/openapi-fixture/" "$SDK_DIR/cli/openapi-fixture/"

# ---------------------------------------------------------------------------
# 2. Project Cargo.toml (not a naive copy — workspace → single-package)
# ---------------------------------------------------------------------------
echo "--- Projecting Cargo.toml ..."

# Extract the workspace version from cli-sdk
WORKSPACE_VERSION="$(grep -A2 '^\[workspace\.package\]' "$CLI_SDK_DIR/Cargo.toml" \
  | grep '^version' | sed 's/.*"\(.*\)".*/\1/')"

if [[ -z "$WORKSPACE_VERSION" ]]; then
  echo "Error: could not extract [workspace.package] version from cli-sdk" >&2
  exit 1
fi

echo "    version: $WORKSPACE_VERSION"

# Extract sections from cli-sdk's Cargo.toml using awk.
# We need: [features], [dependencies], [package.metadata.dist],
# [profile.dist], [build-dependencies], [dev-dependencies]

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
# 3. Provenance marker
# ---------------------------------------------------------------------------
echo "--- Writing provenance marker ..."

cat > "$SDK_DIR/.synced-from" << EOF
cli-sdk@${CLI_SDK_SHA}
EOF

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
