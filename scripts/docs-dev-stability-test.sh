#!/usr/bin/env bash
#
# docs-dev-stability-test.sh
#
# Long-running stability test for `fern docs dev`.
# Starts the dev server, then simulates repeated doc changes (add/modify/delete)
# while checking that:
#   1. No duplicate server processes are spawned
#   2. Disk usage does not grow unboundedly
#   3. The server remains responsive
#
# Usage: ./scripts/docs-dev-stability-test.sh [--cycles N] [--cycle-delay SECONDS]
#
# Environment:
#   CLI_PATH  - path to the built Fern CLI (default: packages/cli/cli/dist/dev/cli.cjs)
#   FERN_TOKEN - auth token (optional, for authenticated fixtures)

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
CYCLES=10
CYCLE_DELAY=5
BACKEND_PORT=48200
SERVER_STARTUP_TIMEOUT=120
DISK_GROWTH_THRESHOLD_KB=102400  # 100 MB

while [[ $# -gt 0 ]]; do
    case "$1" in
        --cycles) CYCLES="$2"; shift 2 ;;
        --cycle-delay) CYCLE_DELAY="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI_PATH="${CLI_PATH:-$REPO_ROOT/packages/cli/cli/dist/dev/cli.cjs}"
FIXTURE_SRC="$REPO_ROOT/packages/cli/ete-tests/src/tests/docs-dev/fixtures/simple/fern"

# Create an isolated working directory so we don't pollute the repo
WORK_DIR="$(mktemp -d)"
FERN_DIR="$WORK_DIR/fern"
trap 'cleanup' EXIT

SERVER_PID=""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

cleanup() {
    echo ""
    echo "=== Cleaning up ==="
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
        kill "$SERVER_PID" 2>/dev/null || true
        # Give it a moment, then force kill
        sleep 2
        kill -9 "$SERVER_PID" 2>/dev/null || true
    fi
    rm -rf "$WORK_DIR"
    echo "Cleanup complete."
}

fail() {
    echo "FAIL: $1" >&2
    exit 1
}

pass() {
    echo "PASS: $1"
}

# Wait for the backend to respond to the load-with-url endpoint
wait_for_server() {
    local url="http://localhost:${BACKEND_PORT}/v2/registry/docs/load-with-url"
    local elapsed=0
    echo "Waiting for server to start on port $BACKEND_PORT (timeout: ${SERVER_STARTUP_TIMEOUT}s)..."
    while [[ $elapsed -lt $SERVER_STARTUP_TIMEOUT ]]; do
        if curl -sf -X POST "$url" -o /dev/null 2>/dev/null; then
            echo "Server is ready after ${elapsed}s."
            return 0
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done
    fail "Server did not start within ${SERVER_STARTUP_TIMEOUT}s"
}

# Check the server still responds with a valid JSON body
check_server_health() {
    local url="http://localhost:${BACKEND_PORT}/v2/registry/docs/load-with-url"
    local response
    response=$(curl -sf -X POST "$url" 2>/dev/null) || fail "Server health check failed - no response"

    # Verify it's valid JSON with expected keys
    echo "$response" | node -e "
        const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
        const keys = Object.keys(data).sort();
        const expected = ['baseUrl', 'definition', 'lightModeEnabled', 'orgId'];
        if (JSON.stringify(keys) !== JSON.stringify(expected)) {
            console.error('Unexpected response keys:', keys);
            process.exit(1);
        }
    " || fail "Server returned invalid response"
}

# Count how many node processes are running the CLI server
count_server_processes() {
    # Count node processes whose command line contains our CLI path and "docs dev"
    local count
    count=$(ps aux | grep -E "node.*cli\.cjs.*docs" | grep -v grep | wc -l)
    echo "$count"
}

# Get disk usage of the working directory in KB
get_disk_usage_kb() {
    du -sk "$WORK_DIR" 2>/dev/null | awk '{print $1}'
}

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

echo "=== Docs Dev Stability Test ==="
echo "Cycles:        $CYCLES"
echo "Cycle delay:   ${CYCLE_DELAY}s"
echo "Backend port:  $BACKEND_PORT"
echo "CLI path:      $CLI_PATH"
echo "Work dir:      $WORK_DIR"
echo ""

# Verify CLI exists
if [[ ! -f "$CLI_PATH" ]]; then
    fail "CLI not found at $CLI_PATH. Build it first with: pnpm turbo run dist:cli:dev --filter=@fern-api/cli"
fi

# Copy fixture to working directory
echo "Copying fixture to $WORK_DIR ..."
cp -r "$FIXTURE_SRC" "$FERN_DIR"

# Record baseline disk usage
BASELINE_DISK_KB=$(get_disk_usage_kb)
echo "Baseline disk usage: ${BASELINE_DISK_KB} KB"

# ---------------------------------------------------------------------------
# Start the server
# ---------------------------------------------------------------------------

echo ""
echo "=== Starting fern docs dev ==="
cd "$WORK_DIR"

FERN_NO_VERSION_REDIRECTION=true node --enable-source-maps "$CLI_PATH" \
    docs dev --backend-port "$BACKEND_PORT" \
    > "$WORK_DIR/server.log" 2>&1 &
SERVER_PID=$!

echo "Server started with PID $SERVER_PID"

# Wait for server to be ready
wait_for_server

# Initial health check
check_server_health
pass "Initial server health check"

# Record process count after startup
INITIAL_PROCESS_COUNT=$(count_server_processes)
echo "Initial server process count: $INITIAL_PROCESS_COUNT"

# ---------------------------------------------------------------------------
# Run stability cycles
# ---------------------------------------------------------------------------

echo ""
echo "=== Running $CYCLES stability cycles ==="

for ((i = 1; i <= CYCLES; i++)); do
    echo ""
    echo "--- Cycle $i/$CYCLES ---"

    # Verify server process is still alive
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        fail "Server process (PID $SERVER_PID) died before cycle $i"
    fi

    # --- Mutation 1: Modify an existing file ---
    echo "  [modify] Updating foo.md ..."
    cat > "$FERN_DIR/foo.md" <<EOF
# Hello from cycle $i

This content was updated during stability test cycle $i.

Some additional content to make the file a bit larger.
EOF

    sleep "$CYCLE_DELAY"

    # --- Mutation 2: Add a new page ---
    echo "  [add] Creating new-page-$i.md ..."
    cat > "$FERN_DIR/new-page-$i.md" <<EOF
# New Page $i

This page was added during stability test cycle $i.
EOF

    sleep "$CYCLE_DELAY"

    # --- Mutation 3: Delete the page we just added (after cycle 1) ---
    if [[ $i -gt 1 ]]; then
        local_prev=$((i - 1))
        if [[ -f "$FERN_DIR/new-page-$local_prev.md" ]]; then
            echo "  [delete] Removing new-page-$local_prev.md ..."
            rm -f "$FERN_DIR/new-page-$local_prev.md"
            sleep "$CYCLE_DELAY"
        fi
    fi

    # --- Check 1: Server still alive ---
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        echo ""
        echo "=== Server log tail ==="
        tail -50 "$WORK_DIR/server.log" || true
        fail "Server process died during cycle $i"
    fi
    pass "Cycle $i: Server process alive"

    # --- Check 2: Server still responds correctly ---
    check_server_health
    pass "Cycle $i: Server health check"

    # --- Check 3: No duplicate processes ---
    CURRENT_PROCESS_COUNT=$(count_server_processes)
    echo "  Process count: $CURRENT_PROCESS_COUNT (initial: $INITIAL_PROCESS_COUNT)"
    if [[ "$CURRENT_PROCESS_COUNT" -gt $((INITIAL_PROCESS_COUNT + 2)) ]]; then
        echo ""
        echo "=== Process list ==="
        ps aux | grep -E "node.*cli\.cjs" | grep -v grep || true
        fail "Cycle $i: Process count grew from $INITIAL_PROCESS_COUNT to $CURRENT_PROCESS_COUNT (possible process leak)"
    fi
    pass "Cycle $i: No duplicate processes"

    # --- Check 4: Disk usage not growing unboundedly ---
    CURRENT_DISK_KB=$(get_disk_usage_kb)
    DISK_GROWTH_KB=$((CURRENT_DISK_KB - BASELINE_DISK_KB))
    echo "  Disk usage: ${CURRENT_DISK_KB} KB (growth: ${DISK_GROWTH_KB} KB, threshold: ${DISK_GROWTH_THRESHOLD_KB} KB)"
    if [[ "$DISK_GROWTH_KB" -gt "$DISK_GROWTH_THRESHOLD_KB" ]]; then
        echo ""
        echo "=== Disk usage breakdown ==="
        du -sh "$WORK_DIR"/* 2>/dev/null || true
        fail "Cycle $i: Disk usage grew by ${DISK_GROWTH_KB} KB (exceeds threshold of ${DISK_GROWTH_THRESHOLD_KB} KB)"
    fi
    pass "Cycle $i: Disk usage within bounds"
done

# ---------------------------------------------------------------------------
# Final checks
# ---------------------------------------------------------------------------

echo ""
echo "=== Final checks ==="

# Clean up the last added page
if [[ -f "$FERN_DIR/new-page-$CYCLES.md" ]]; then
    rm -f "$FERN_DIR/new-page-$CYCLES.md"
fi

# Restore foo.md
cat > "$FERN_DIR/foo.md" <<EOF
# hi
EOF

sleep "$CYCLE_DELAY"

# Final health check
check_server_health
pass "Final server health check"

# Final process count
FINAL_PROCESS_COUNT=$(count_server_processes)
echo "Final process count: $FINAL_PROCESS_COUNT (initial: $INITIAL_PROCESS_COUNT)"

# Final disk usage
FINAL_DISK_KB=$(get_disk_usage_kb)
FINAL_GROWTH_KB=$((FINAL_DISK_KB - BASELINE_DISK_KB))
echo "Final disk usage: ${FINAL_DISK_KB} KB (total growth: ${FINAL_GROWTH_KB} KB)"

echo ""
echo "=== All $CYCLES stability cycles passed ==="
echo "Server remained stable through $CYCLES cycles of doc modifications."
exit 0
