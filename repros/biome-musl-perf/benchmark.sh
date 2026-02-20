#!/usr/bin/env bash
set -euo pipefail

BIOME_CMD="./node_modules/.bin/biome check --fix --unsafe --skip-parse-errors --no-errors-on-unmatched --max-diagnostics=none"

echo "=== Biome Docker Performance Benchmark ==="
echo ""

FILE_COUNT=$(find sdk/src -name '*.ts' | wc -l)
echo "TypeScript files: $FILE_COUNT"
echo ""

# ── Native (host) benchmark ──────────────────────────────────────────────────
echo "--- Native (host, glibc) ---"
cd sdk
$BIOME_CMD > /dev/null 2>&1 || true
NATIVE_START=$(date +%s%3N)
$BIOME_CMD > /dev/null 2>&1 || true
NATIVE_END=$(date +%s%3N)
NATIVE_MS=$((NATIVE_END - NATIVE_START))
cd ..
echo "Time: ${NATIVE_MS}ms"
echo ""

# ── Docker Alpine benchmark ──────────────────────────────────────────────────
echo "--- Docker Alpine (node:22.12-alpine3.20, musl) ---"
echo "Building image..."
docker build -t biome-repro-alpine -f Dockerfile . --quiet

echo "Running biome check..."
ALPINE_START=$(date +%s%3N)
docker run --rm biome-repro-alpine -c "$BIOME_CMD" > /dev/null 2>&1 || true
ALPINE_END=$(date +%s%3N)
ALPINE_MS=$((ALPINE_END - ALPINE_START))
echo "Time: ${ALPINE_MS}ms"
echo ""

# ── Docker Debian benchmark ──────────────────────────────────────────────────
echo "--- Docker Debian (node:22.12-bookworm-slim, glibc) ---"
echo "Building image..."
docker build -t biome-repro-debian -f Dockerfile.debian . --quiet

echo "Running biome check..."
DEBIAN_START=$(date +%s%3N)
docker run --rm biome-repro-debian -c "$BIOME_CMD" > /dev/null 2>&1 || true
DEBIAN_END=$(date +%s%3N)
DEBIAN_MS=$((DEBIAN_END - DEBIAN_START))
echo "Time: ${DEBIAN_MS}ms"
echo ""

# ── Summary ──────────────────────────────────────────────────────────────────
echo "=== Summary ==="
echo "Native (glibc):         ${NATIVE_MS}ms"
echo "Docker Alpine (musl):   ${ALPINE_MS}ms"
echo "Docker Debian (glibc):  ${DEBIAN_MS}ms"
echo ""
echo "Note: Docker times include container startup overhead (~1-2s)."
echo "Look at biome's own 'Checked N files in Xms' output for pure biome time."
