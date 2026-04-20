#!/bin/bash
# Autoresearch benchmark harness for Fern TypeScript SDK generator.
# Compiles the generator, runs generation against Square's OpenAPI spec,
# and reports timing + correctness validation.
#
# Usage:
#   ./autoresearch/benchmark.sh              # 3 runs (default)
#   ./autoresearch/benchmark.sh 5            # 5 runs
#   ./autoresearch/benchmark.sh 1 --quick    # 1 run, skip validation
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

NUM_RUNS=${1:-3}
QUICK_MODE="${2:-}"
SPEC_PATH="benchmarks/fern/apis/square"
GENERATOR="ts-sdk"
BASELINE_DIR="autoresearch/baseline"
OUTPUT_DIR="/tmp/autoresearch-square-output"
GEN_TIMES=()
E2E_TIMES=()

# --- Compile generator + seed CLI ---
echo "=== Compiling ==="
COMPILE_START=$(python3 -c 'import time; print(int(time.time()*1000))')
if ! pnpm turbo run dist:cli --filter @fern-typescript/sdk-generator-cli --filter @fern-api/seed-cli > /tmp/autoresearch-compile.log 2>&1; then
  COMPILE_END=$(python3 -c 'import time; print(int(time.time()*1000))')
  COMPILE_MS=$(( COMPILE_END - COMPILE_START ))
  echo "COMPILE_FAILED (${COMPILE_MS}ms)"
  tail -30 /tmp/autoresearch-compile.log
  echo "---"
  echo "status: compile_failed"
  echo "compile_ms: $COMPILE_MS"
  exit 1
fi
COMPILE_END=$(python3 -c 'import time; print(int(time.time()*1000))')
COMPILE_MS=$(( COMPILE_END - COMPILE_START ))
echo "Compile: ${COMPILE_MS}ms"

# --- Benchmark ---
echo ""
echo "=== Benchmarking ($NUM_RUNS runs) ==="

for i in $(seq 1 "$NUM_RUNS"); do
  rm -rf "$OUTPUT_DIR"
  mkdir -p "$OUTPUT_DIR"

  E2E_START=$(python3 -c 'import time; print(int(time.time()*1000))')
  if ! pnpm seed:local run --generator "$GENERATOR" --path "$SPEC_PATH" --skip-scripts --output-path "$OUTPUT_DIR" > /tmp/autoresearch-run.log 2>&1; then
    E2E_END=$(python3 -c 'import time; print(int(time.time()*1000))')
    E2E_MS=$(( E2E_END - E2E_START ))
    echo "Run $i: FAILED (${E2E_MS}ms)"
    tail -30 /tmp/autoresearch-run.log
    echo "---"
    echo "status: run_failed"
    echo "compile_ms: $COMPILE_MS"
    exit 2
  fi
  E2E_END=$(python3 -c 'import time; print(int(time.time()*1000))')
  E2E_MS=$(( E2E_END - E2E_START ))
  E2E_TIMES+=("$E2E_MS")

  # Extract seed-reported generation time from the results table row.
  # The ANSI-stripped row looks like: │ custom │  -- │ success │  18.2s │ ...
  GEN_TIME_RAW=$(python3 -c "
import re
with open('/tmp/autoresearch-run.log') as f:
    for line in f:
        clean = re.sub(r'\x1b\[[0-9;]*m', '', line)
        if 'custom' in clean and 'success' in clean:
            m = re.search(r'(\d+\.?\d*)\s*s\s*\│', clean)
            if m:
                print(m.group(1))
                break
" 2>/dev/null || echo "")
  if [ -n "$GEN_TIME_RAW" ]; then
    GEN_MS=$(python3 -c "print(int(float('$GEN_TIME_RAW') * 1000))")
  else
    GEN_MS="$E2E_MS"
  fi
  GEN_TIMES+=("$GEN_MS")

  # Check for generation failure in output
  if grep -q "Generation failed" /tmp/autoresearch-run.log; then
    echo "Run $i: GENERATION_FAILED (e2e=${E2E_MS}ms)"
    echo "---"
    echo "status: generation_failed"
    echo "compile_ms: $COMPILE_MS"
    tail -20 /tmp/autoresearch-run.log
    exit 3
  fi

  echo "Run $i: gen=${GEN_MS}ms e2e=${E2E_MS}ms"
done

# --- Compute medians ---
IFS=$'\n' SORTED_GEN=($(printf '%s\n' "${GEN_TIMES[@]}" | sort -n)); unset IFS
IFS=$'\n' SORTED_E2E=($(printf '%s\n' "${E2E_TIMES[@]}" | sort -n)); unset IFS
MEDIAN_GEN=${SORTED_GEN[$(( NUM_RUNS / 2 ))]}
MEDIAN_E2E=${SORTED_E2E[$(( NUM_RUNS / 2 ))]}

# --- Validate correctness ---
VALIDATION="skipped"
if [ "$QUICK_MODE" != "--quick" ] && [ -f "$BASELINE_DIR/manifest.sha256" ]; then
  echo ""
  echo "=== Validating correctness ==="

  if [ -d "$OUTPUT_DIR" ] && [ "$(find "$OUTPUT_DIR" -type f | head -1)" ]; then
    CURRENT_MANIFEST="/tmp/autoresearch-current-manifest.sha256"
    (cd "$OUTPUT_DIR" && find . -type f | sort | xargs shasum -a 256) > "$CURRENT_MANIFEST" 2>/dev/null || true

    if diff -q "$BASELINE_DIR/manifest.sha256" "$CURRENT_MANIFEST" > /dev/null 2>&1; then
      VALIDATION="identical"
      echo "Output identical to baseline (1987 files)"
    else
      DIFF_COUNT=$(diff "$BASELINE_DIR/manifest.sha256" "$CURRENT_MANIFEST" 2>/dev/null | grep "^[<>]" | wc -l | tr -d ' ')
      VALIDATION="differs:${DIFF_COUNT}_lines"
      echo "Output differs from baseline ($DIFF_COUNT changed lines in manifest)"
      diff "$BASELINE_DIR/manifest.sha256" "$CURRENT_MANIFEST" 2>/dev/null | head -20 || true
    fi
  else
    VALIDATION="output_not_found"
    echo "No generated output found at $OUTPUT_DIR"
  fi
fi

# --- Summary ---
echo ""
echo "=== Results ==="
echo "---"
echo "median_gen_ms:  $MEDIAN_GEN"
echo "median_e2e_ms:  $MEDIAN_E2E"
echo "compile_ms:     $COMPILE_MS"
echo "num_runs:       $NUM_RUNS"
echo "validation:     $VALIDATION"
echo "all_gen_ms:     ${GEN_TIMES[*]}"
echo "all_e2e_ms:     ${E2E_TIMES[*]}"
echo "status:         ok"
