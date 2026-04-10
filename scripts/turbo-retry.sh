#!/usr/bin/env bash
# Retry wrapper for turbo commands that intermittently hang on remote cache initialization.
#
# Turbo has a known issue (https://github.com/vercel/turborepo/issues/8281) where it
# hangs indefinitely after printing "Remote caching enabled" with zero further output.
# This script monitors command output and retries if no output is produced for a
# configurable timeout period.
#
# Usage: ./scripts/turbo-retry.sh <command...>
# Example: ./scripts/turbo-retry.sh pnpm test
#          ./scripts/turbo-retry.sh pnpm turbo run dist:cli:dev --filter=@fern-api/cli
#
# Environment variables:
#   TURBO_HANG_TIMEOUT  - seconds of silence before killing (default: 120)
#   TURBO_RETRY_MAX     - max retry attempts (default: 3)

set -uo pipefail

HANG_TIMEOUT="${TURBO_HANG_TIMEOUT:-120}"
MAX_RETRIES="${TURBO_RETRY_MAX:-3}"

for attempt in $(seq 1 "$MAX_RETRIES"); do
  echo "--- Attempt $attempt/$MAX_RETRIES: $* ---"

  # Stop any stale turbo daemon before each attempt
  pnpm turbo daemon stop 2>/dev/null || true

  # Capture output to a temp file so we can monitor activity
  OUTFILE=$(mktemp)
  HUNG=false

  # Run command with stdout+stderr redirected to file
  "$@" > "$OUTFILE" 2>&1 &
  CMD_PID=$!

  LAST_SIZE=0
  LAST_CHANGE=$(date +%s)

  # Monitor loop: stream output and detect hangs
  while kill -0 "$CMD_PID" 2>/dev/null; do
    sleep 5

    # Print any new output since last check
    CURRENT_SIZE=$(stat -c%s "$OUTFILE" 2>/dev/null || echo 0)
    if [ "$CURRENT_SIZE" -gt "$LAST_SIZE" ]; then
      tail -c +"$((LAST_SIZE + 1))" "$OUTFILE"
      LAST_SIZE=$CURRENT_SIZE
      LAST_CHANGE=$(date +%s)
    fi

    # Check for hang
    NOW=$(date +%s)
    SILENT=$((NOW - LAST_CHANGE))
    if [ "$SILENT" -ge "$HANG_TIMEOUT" ]; then
      echo ""
      echo "::warning::No output for ${SILENT}s — turbo appears hung. Killing process..."
      kill -TERM "$CMD_PID" 2>/dev/null || true
      sleep 3
      kill -9 "$CMD_PID" 2>/dev/null || true
      HUNG=true
      break
    fi
  done

  # Wait for process to fully exit and capture status
  wait "$CMD_PID" 2>/dev/null
  EXIT_CODE=$?

  # Print any remaining output
  FINAL_SIZE=$(stat -c%s "$OUTFILE" 2>/dev/null || echo 0)
  if [ "$FINAL_SIZE" -gt "$LAST_SIZE" ]; then
    tail -c +"$((LAST_SIZE + 1))" "$OUTFILE"
  fi
  rm -f "$OUTFILE"

  if [ "$EXIT_CODE" -eq 0 ]; then
    echo "--- Succeeded on attempt $attempt ---"
    exit 0
  fi

  if $HUNG; then
    echo "::warning::Turbo hung on attempt $attempt/$MAX_RETRIES"
    if [ "$attempt" -lt "$MAX_RETRIES" ]; then
      echo "Retrying in 5s..."
      sleep 5
      continue
    fi
    echo "::error::All $MAX_RETRIES attempts failed due to turbo hanging"
    exit 1
  fi

  # Real failure (not a hang) — don't retry
  echo "::error::Command failed with exit code $EXIT_CODE"
  exit "$EXIT_CODE"
done
