#!/usr/bin/env bash
# Starts `fern docs dev` ($FERN_BIN $FERN_DOCS_DEV_ARGS), waits for it, runs the Playwright smoke suite.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Kill any leftover server from a previous attempt
if [ -f /tmp/fern-server.pid ]; then
  OLD_PID=$(cat /tmp/fern-server.pid)
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Killing leftover server (PID $OLD_PID) from previous attempt..."
    kill "$OLD_PID" 2>/dev/null || true
    sleep 2
  fi
  rm -f /tmp/fern-server.pid
fi
# Wait for port 3000 to be released by the previous renderer's server
for w in $(seq 1 30); do
  if ! curl -s -o /dev/null --max-time 2 http://localhost:3000/ 2>/dev/null; then
    break
  fi
  if [ "$w" -eq 30 ]; then
    echo "Port 3000 still in use after 30s; previous server did not exit"
    exit 1
  fi
  sleep 1
done

LOG_FILE="/tmp/fern-docs-dev.log"
rm -f "$LOG_FILE"

# Start the fern docs dev server
cd docs-preview-smoke-test/fern
"$FERN_BIN" docs dev $FERN_DOCS_DEV_ARGS > "$LOG_FILE" 2>&1 &
FERN_PID=$!
cd "$REPO_ROOT"
# Always stop the server so the next renderer run (or the retry) gets a free port
trap 'kill "$FERN_PID" 2>/dev/null || true; rm -f /tmp/fern-server.pid' EXIT

# Wait for the server to be ready
for i in $(seq 1 180); do
  if grep -qi "ready on" "$LOG_FILE" 2>/dev/null; then
    echo "Server ready after ${i}s"
    break
  fi

  if ! kill -0 $FERN_PID 2>/dev/null; then
    echo "Server crashed during startup (known Node.js v24 Windows issue)"
    cat "$LOG_FILE"
    exit 1
  fi

  if [ $i -eq 180 ]; then
    echo "Server start timed out after 180s"
    cat "$LOG_FILE"
    kill $FERN_PID 2>/dev/null || true
    exit 1
  fi

  sleep 1
done

# Verify server is still alive before running tests
if ! kill -0 $FERN_PID 2>/dev/null; then
  echo "Server died after reporting ready (known Node.js v24 Windows crash)"
  cat "$LOG_FILE"
  exit 1
fi

# Store PID for cleanup
echo "$FERN_PID" > /tmp/fern-server.pid

# Wait for HTTP 200 on /sitemap.xml
echo "Waiting for server to return HTTP 200 on /sitemap.xml..."
for j in $(seq 1 30); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000/sitemap.xml 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "Server returning 200 on /sitemap.xml after ${j}s"
    break
  fi
  if [ $j -eq 30 ]; then
    echo "Server never returned 200 on /sitemap.xml after 30s (last HTTP $HTTP_CODE)"
    cat "$LOG_FILE"
    exit 1
  fi
  sleep 1
done

# Warm up SSR — first render may trigger compilation
echo "Warming up SSR on /welcome..."
for k in $(seq 1 60); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:3000/welcome 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "SSR warm-up succeeded after attempt ${k}"
    break
  fi
  if [ $k -eq 60 ]; then
    echo "SSR warm-up failed after 60 attempts (last HTTP $HTTP_CODE)"
    cat "$LOG_FILE"
    exit 1
  fi
  sleep 2
done

# Run Playwright tests
cd docs-preview-smoke-test/playwright && npx playwright test smoke.spec.ts --config playwright.config.ts
