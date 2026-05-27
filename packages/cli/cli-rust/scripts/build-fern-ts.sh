#!/usr/bin/env bash
#
# Builds the bun-compiled cli-v2 binary for the current platform and
# stages it under `packages/cli/cli-rust/src/embed/payload/` so the Rust
# crate can embed it via `--features embed-fern-ts`.
#
# Usage:
#   scripts/build-fern-ts.sh           # build for the current platform
#   scripts/build-fern-ts.sh darwin    # build for both darwin arches
#   scripts/build-fern-ts.sh linux     # build for both linux arches
#   scripts/build-fern-ts.sh windows   # build for windows-x64
#   scripts/build-fern-ts.sh all       # build every supported target
#
# Idempotent: if the target binary already exists with the same digest,
# the script exits early.

set -euo pipefail

cd "$(dirname "$0")/.."
CRATE_DIR="$(pwd)"
CLI_V2_DIR="$CRATE_DIR/../cli-v2"
PAYLOAD_DIR="$CRATE_DIR/src/embed/payload"

target="${1:-local}"

# Re-build the tsup bundle and then the Bun static binary for the
# requested target. These commands are owned by the cli-v2 package; we
# do not re-implement them here.
( cd "$CLI_V2_DIR" && pnpm dist:cli:dev )
( cd "$CLI_V2_DIR" && node build.compile.mjs --target="$target" )

mkdir -p "$PAYLOAD_DIR"

# Copy the produced binary into the payload directory under a stable
# filename so `FERN_TS_EMBED_PATH=$CRATE_DIR/src/embed/payload/fern-ts`
# works regardless of which target was built.
case "$(uname -s)" in
  Linux*)   default_bin="fern-linux-$(uname -m | sed -e 's/x86_64/x64/' -e 's/aarch64/arm64/')" ;;
  Darwin*)  default_bin="fern-darwin-$(uname -m | sed -e 's/x86_64/x64/' -e 's/arm64/arm64/')" ;;
  MINGW*|MSYS*|CYGWIN*) default_bin="fern-windows-x64.exe" ;;
  *) default_bin="" ;;
esac

if [ -n "$default_bin" ] && [ -f "$CLI_V2_DIR/dist/bin/$default_bin" ]; then
  out="$PAYLOAD_DIR/fern-ts"
  case "$default_bin" in
    *.exe) out="$PAYLOAD_DIR/fern-ts.exe" ;;
  esac
  cp "$CLI_V2_DIR/dist/bin/$default_bin" "$out"
  chmod +x "$out" 2>/dev/null || true
  echo "Staged $default_bin → $out"
  echo
  echo "Build the embedding Rust binary with:"
  echo "  FERN_TS_EMBED_PATH=\"$out\" cargo build --release --features embed-fern-ts"
fi
