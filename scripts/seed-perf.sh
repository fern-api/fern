#!/usr/bin/env bash
set -uo pipefail

# Seed performance profiler — runs seed test with --profile and Docker stats monitoring
# Usage: scripts/seed-perf.sh <generator> [--fixture name ...] [--parallel N] [--with-scripts] [--interval N] [--sample N]
#
# Examples:
#   scripts/seed-perf.sh ts-sdk                                  # all fixtures
#   scripts/seed-perf.sh ts-sdk --fixture exhaustive basic-auth  # just 2 fixtures
#   scripts/seed-perf.sh ts-sdk --sample 10                      # random 10 fixtures
#   scripts/seed-perf.sh ts-sdk --parallel 8 --sample 5          # 5 fixtures, 8 parallel

GENERATOR="${1:?Usage: $0 <generator> [--fixture name ...] [--parallel N] [--sample N] [--with-scripts] [--interval N]}"
shift

PARALLEL=16
SKIP_SCRIPTS="--skip-scripts"
LOG_LEVEL="info"
SAMPLE_INTERVAL=5
FIXTURES=()
SAMPLE_COUNT=0
OUTPUT_FOLDER=""
SEQUENTIAL=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        --parallel) PARALLEL="$2"; shift 2 ;;
        --with-scripts) SKIP_SCRIPTS=""; shift ;;
        --log-level) LOG_LEVEL="$2"; shift 2 ;;
        --interval) SAMPLE_INTERVAL="$2"; shift 2 ;;
        --sample) SAMPLE_COUNT="$2"; shift 2 ;;
        --outputFolder) OUTPUT_FOLDER="$2"; shift 2 ;;
        --sequential) SEQUENTIAL=1; shift ;;
        --fixture)
            shift
            while [[ $# -gt 0 && ! "$1" =~ ^-- ]]; do
                FIXTURES+=("$1")
                shift
            done
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# If --sample N was given, pick N random unique fixture names from the full list
if [[ "$SAMPLE_COUNT" -gt 0 && ${#FIXTURES[@]} -eq 0 ]]; then
    SAMPLED=$(node --enable-source-maps packages/seed/dist/cli.cjs list-test-fixtures \
        --generator "$GENERATOR" --groups 1 2>/dev/null \
        | python3 -c "
import json, sys, random
d = json.load(sys.stdin)
# Extract unique fixture names (before the colon)
names = set()
for f in d[0].get('fixtures', []):
    name = f.split(':')[0] if ':' in f else f
    names.add(name)
names = sorted(names)
n = min(int(sys.argv[1]), len(names))
sample = random.sample(names, n)
for s in sample:
    print(s)
" "$SAMPLE_COUNT" 2>/dev/null || true)
    if [[ -n "$SAMPLED" ]]; then
        mapfile -t FIXTURES <<< "$SAMPLED"
        echo "Sampled ${#FIXTURES[@]} fixtures: ${FIXTURES[*]}"
        echo ""
    fi
fi

REPORT_DIR="/tmp/seed-perf-$$"
mkdir -p "$REPORT_DIR"
SEED_LOG="$REPORT_DIR/seed.log"
PROFILE_LOG="$REPORT_DIR/profile.jsonl"
STATS_LOG="$REPORT_DIR/stats.csv"
SUMMARY="$REPORT_DIR/summary.txt"

# Build fixture args for seed CLI
FIXTURE_ARGS=""
if [[ ${#FIXTURES[@]} -gt 0 ]]; then
    for f in "${FIXTURES[@]}"; do
        FIXTURE_ARGS="$FIXTURE_ARGS --fixture $f"
    done
fi
if [[ -n "$OUTPUT_FOLDER" ]]; then
    FIXTURE_ARGS="$FIXTURE_ARGS --outputFolder $OUTPUT_FOLDER"
fi

echo "==========================================="
echo " Seed Performance Profiler"
echo "==========================================="
echo " Generator:       $GENERATOR"
if [[ "$SEQUENTIAL" -eq 1 ]]; then
echo " Mode:            sequential (one test case at a time)"
else
echo " Parallel:        $PARALLEL"
fi
echo " Skip scripts:    $([[ -n "$SKIP_SCRIPTS" ]] && echo yes || echo no)"
echo " Sample interval: ${SAMPLE_INTERVAL}s"
echo " Report dir:      $REPORT_DIR"
if [[ ${#FIXTURES[@]} -gt 0 ]]; then
echo " Fixtures:        ${FIXTURES[*]} (${#FIXTURES[@]} selected)"
else
echo " Fixtures:        all"
fi
echo "==========================================="
echo ""

# Get fixture count
if [[ ${#FIXTURES[@]} -gt 0 ]]; then
    FIXTURE_COUNT="${#FIXTURES[@]}"
else
    FIXTURE_COUNT=$(node --enable-source-maps packages/seed/dist/cli.cjs list-test-fixtures \
        --generator "$GENERATOR" --groups 1 2>/dev/null \
        | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d[0].get('fixtures',[])))" 2>/dev/null || echo "?")
fi
echo "Total fixtures: $FIXTURE_COUNT"
echo ""

# Docker image name from seed.yml
DOCKER_IMAGE=$(python3 -c "
import yaml
with open('seed/$GENERATOR/seed.yml') as f:
    print(yaml.safe_load(f).get('test',{}).get('docker',{}).get('image','unknown'))
" 2>/dev/null || echo "unknown")

# --- Docker stats monitor (background) ---
echo "timestamp,containers,total_mem_mib,avg_mem_mib,max_mem_mib,total_cpu_pct" > "$STATS_LOG"

monitor_docker_stats() {
    local start_time=$SECONDS
    while true; do
        sleep "$SAMPLE_INTERVAL"

        local container_ids
        container_ids=$(docker ps -q --filter "ancestor=$DOCKER_IMAGE" 2>/dev/null || true)
        if [[ -z "$container_ids" ]]; then
            continue
        fi

        local stats
        stats=$(docker stats --no-stream --format "{{.MemUsage}}|{{.CPUPerc}}" $container_ids 2>/dev/null || true)
        if [[ -z "$stats" ]]; then
            continue
        fi

        local count=0 total_mem=0 max_mem=0 total_cpu=0
        while IFS='|' read -r mem cpu; do
            local mem_val mem_unit mem_mib cpu_val
            mem_val=$(echo "$mem" | grep -oE '^[0-9.]+' || echo 0)
            mem_unit=$(echo "$mem" | grep -oE 'GiB|MiB|KiB' || echo MiB)
            case "$mem_unit" in
                GiB) mem_mib=$(echo "$mem_val * 1024" | bc 2>/dev/null || echo 0) ;;
                KiB) mem_mib=$(echo "$mem_val / 1024" | bc 2>/dev/null || echo 0) ;;
                *) mem_mib="$mem_val" ;;
            esac
            cpu_val=$(echo "$cpu" | grep -oE '[0-9.]+' || echo 0)

            total_mem=$(echo "$total_mem + $mem_mib" | bc 2>/dev/null || echo 0)
            total_cpu=$(echo "$total_cpu + $cpu_val" | bc 2>/dev/null || echo 0)
            if (( $(echo "$mem_mib > $max_mem" | bc 2>/dev/null || echo 0) )); then
                max_mem="$mem_mib"
            fi
            count=$((count + 1))
        done <<< "$stats"

        local avg_mem=0
        if [[ $count -gt 0 ]]; then
            avg_mem=$(echo "$total_mem / $count" | bc 2>/dev/null || echo 0)
        fi

        local elapsed=$((SECONDS - start_time))
        echo "$elapsed,$count,${total_mem%.*},${avg_mem%.*},${max_mem%.*},${total_cpu%.*}" >> "$STATS_LOG"
    done
}

# --- Profile monitor (background) — single python3 process, no tail -f ---
monitor_profile() {
    # Wait for profile file to exist
    while [[ ! -f "$PROFILE_LOG" ]]; do sleep 1; done

    python3 -u -c "
import json, sys, time, subprocess, os

profile_path = os.environ['PROFILE_LOG']
stats_path = os.environ['STATS_LOG']
fixture_count = os.environ['FIXTURE_COUNT']

active = {}
completed = 0
last_pos = 0

try:
    docker_limit = subprocess.check_output(
        ['docker', 'info', '--format', '{{.MemTotal}}'],
        stderr=subprocess.DEVNULL, text=True
    ).strip()
    docker_limit = f'{int(docker_limit) / 1073741824:.0f}'
except Exception:
    docker_limit = '?'

phase_order = ['workspace_load', 'lock_wait', 'ir_generation', 'ir_migration',
               'write_to_disk', 'copy_in', 'exec', 'copy_out', 'total']

while True:
    try:
        with open(profile_path, 'r') as f:
            f.seek(last_pos)
            new_lines = f.readlines()
            last_pos = f.tell()
    except Exception:
        time.sleep(0.5)
        continue

    for line in new_lines:
        line = line.strip()
        if not line:
            continue
        try:
            e = json.loads(line)
        except json.JSONDecodeError:
            continue
        event = e.get('event', '')
        phase = e.get('phase', '')
        if event == 'start':
            active[phase] = active.get(phase, 0) + 1
        elif event == 'end':
            active[phase] = max(0, active.get(phase, 0) - 1)
            if phase == 'total':
                completed += 1

    mem_gib = '?'
    containers = '?'
    try:
        with open(stats_path, 'r') as sf:
            lines = sf.readlines()
            if len(lines) > 1:
                parts = lines[-1].strip().split(',')
                if len(parts) > 2:
                    containers = parts[1]
                    mem_gib = f'{float(parts[2]) / 1024:.1f}'
    except Exception:
        pass

    in_flight = []
    total_in_flight = 0
    for p in phase_order:
        c = active.get(p, 0)
        if c > 0:
            total_in_flight += c
            in_flight.append(f'{p}: {c}')
    for p, c in active.items():
        if c > 0 and p not in phase_order:
            total_in_flight += c
            in_flight.append(f'{p}: {c}')

    summary = ', '.join(in_flight) if in_flight else 'idle'
    sys.stderr.write(
        f'\r  [done: {completed:3d}/{fixture_count}] containers: {containers} | '
        f'mem: {mem_gib}/{docker_limit} GiB | in-flight: {total_in_flight} ({summary})          '
    )
    sys.stderr.flush()
    time.sleep(0.5)
"
}

# --- Run seed test ---
echo "Starting seed test..."
echo ""

START_TIME=$SECONDS

export PROFILE_LOG STATS_LOG FIXTURE_COUNT

monitor_docker_stats &
DOCKER_MONITOR_PID=$!

monitor_profile &
PROFILE_MONITOR_PID=$!

SEED_PID=""
INTERRUPTED=0

cleanup() {
    # Prevent re-entrancy
    trap - EXIT INT TERM
    echo ""
    echo "Cleaning up..."
    # Kill all child processes of this script
    pkill -P $$ 2>/dev/null || true
    # Also kill seed and its children specifically
    if [[ -n "$SEED_PID" ]] && kill -0 "$SEED_PID" 2>/dev/null; then
        # Kill the entire process tree rooted at seed
        pkill -P "$SEED_PID" 2>/dev/null || true
        kill "$SEED_PID" 2>/dev/null || true
    fi
    kill "$DOCKER_MONITOR_PID" 2>/dev/null || true
    kill "$PROFILE_MONITOR_PID" 2>/dev/null || true
    # Brief wait for processes to die
    sleep 1
    echo "Done. Partial results in: $REPORT_DIR"
}

handle_interrupt() {
    INTERRUPTED=1
    cleanup
    exit 130
}

trap handle_interrupt INT TERM
trap cleanup EXIT

if [[ "$SEQUENTIAL" -eq 1 ]]; then
    # Enumerate test cases using list-test-fixtures, filtered to selected fixtures
    TEST_CASES=$(node --enable-source-maps packages/seed/dist/cli.cjs list-test-fixtures \
        --generator "$GENERATOR" --groups 1 2>/dev/null \
        | python3 -c "
import json, sys
fixtures_filter = set('${FIXTURES[*]}'.split()) if '${FIXTURES[*]}' else set()
d = json.load(sys.stdin)
for f in d[0].get('fixtures', []):
    name = f.split(':')[0] if ':' in f else f
    if fixtures_filter and name not in fixtures_filter:
        continue
    print(f)
" 2>/dev/null || true)

    CASE_COUNT=$(echo "$TEST_CASES" | grep -c . || echo 0)
    echo "  Running $CASE_COUNT test cases sequentially..."
    echo ""

    # Create dir for per-case profile files
    SEQ_PROFILE_DIR="$REPORT_DIR/seq-profiles"
    mkdir -p "$SEQ_PROFILE_DIR"

    # Clear the merged profile file
    > "$PROFILE_LOG"

    EXIT_CODE=0
    CASE_NUM=0
    while IFS= read -r tc; do
        [[ -z "$tc" ]] && continue
        CASE_NUM=$((CASE_NUM + 1))

        if [[ "$tc" == *:* ]]; then
            TC_FIXTURE="${tc%%:*}"
            TC_OUTPUT="${tc#*:}"
            TC_ARGS="--fixture $TC_FIXTURE --outputFolder $TC_OUTPUT"
        else
            TC_FIXTURE="$tc"
            TC_OUTPUT=""
            TC_ARGS="--fixture $TC_FIXTURE"
        fi

        # Each invocation gets its own profile file
        TC_PROFILE="$SEQ_PROFILE_DIR/profile-${CASE_NUM}.jsonl"

        echo "  [$CASE_NUM/$CASE_COUNT] $tc"
        pnpm seed test \
            --generator "$GENERATOR" \
            --parallel 1 \
            --log-level "$LOG_LEVEL" \
            --profile "$TC_PROFILE" \
            $SKIP_SCRIPTS \
            $TC_ARGS \
            >> "$SEED_LOG" 2>&1 &
        SEED_PID=$!
        wait "$SEED_PID" || true
        local_exit=$?
        SEED_PID=""

        # Append this case's profile to the merged file
        if [[ -f "$TC_PROFILE" ]]; then
            cat "$TC_PROFILE" >> "$PROFILE_LOG"
        fi

        if [[ $local_exit -ne 0 ]]; then
            EXIT_CODE=$local_exit
            echo "    FAILED (exit $local_exit)"
        fi
    done <<< "$TEST_CASES"
else
    pnpm seed test \
        --generator "$GENERATOR" \
        --parallel "$PARALLEL" \
        --log-level "$LOG_LEVEL" \
        --profile "$PROFILE_LOG" \
        $SKIP_SCRIPTS \
        $FIXTURE_ARGS \
        > "$SEED_LOG" 2>&1 &
    SEED_PID=$!
    wait "$SEED_PID" || true
    EXIT_CODE=$?
    SEED_PID=""
fi

END_TIME=$SECONDS
ELAPSED=$((END_TIME - START_TIME))

# Kill monitors
kill "$DOCKER_MONITOR_PID" 2>/dev/null || true
kill "$PROFILE_MONITOR_PID" 2>/dev/null || true
sleep 1
trap - EXIT INT TERM

if [[ "$INTERRUPTED" -eq 1 ]]; then
    exit 130
fi
echo ""
echo ""

# --- Generate summary from JSONL profile data ---
PHASE_SUMMARY=$(python3 -c "
import json, sys, os

profile_path = '$PROFILE_LOG'
if not os.path.exists(profile_path):
    print('  (no profile data)')
    sys.exit(0)

events = []
with open(profile_path) as f:
    for line in f:
        line = line.strip()
        if line:
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                pass

# Collect end events with durations by phase
phase_durations = {}
fixture_totals = {}
for e in events:
    if e.get('event') != 'end' or 'ms' not in e:
        continue
    phase = e['phase']
    ms = e['ms']
    phase_durations.setdefault(phase, []).append(ms)
    if phase == 'total':
        fixture_totals[e['id']] = ms

# Print phase breakdown
phase_order = ['workspace_load', 'lock_wait', 'ir_generation', 'ir_migration', 'write_to_disk', 'copy_in', 'exec', 'copy_out', 'total']
def fmt(ms):
    if ms < 1000:
        return f'{ms:.0f}ms'
    elif ms < 60000:
        return f'{ms/1000:.1f}s'
    else:
        return f'{ms/60000:.1f}m'

print(' Phase Breakdown (p50 / p90 / max):')
for phase in phase_order:
    durations = phase_durations.get(phase, [])
    if not durations:
        continue
    durations.sort()
    n = len(durations)
    p50 = durations[int(n * 0.5)]
    p90 = durations[int(n * 0.9)]
    mx = durations[-1]
    print(f'   {phase:20s} {fmt(p50):>8s} / {fmt(p90):>8s} / {fmt(mx):>8s}  ({n} samples)')

# Print slowest fixtures
print()
print(' Slowest fixtures:')
sorted_fixtures = sorted(fixture_totals.items(), key=lambda x: -x[1])[:10]
for fid, total_ms in sorted_fixtures:
    # Find the exec time for this fixture
    exec_ms = 0
    for e in events:
        if e.get('id') == fid and e.get('phase') == 'exec' and e.get('event') == 'end':
            exec_ms = e.get('ms', 0)
            break
    print(f'   {fid:50s} {fmt(total_ms):>8s} (exec: {fmt(exec_ms)})')
" 2>/dev/null || echo "  (failed to parse profile data)")

# Peak Docker stats from CSV
PEAK_MEM=$(awk -F, 'NR>1 && $3+0 > max {max=$3+0} END {printf "%.1f", max/1024}' "$STATS_LOG" 2>/dev/null || echo "?")
PEAK_CONTAINERS=$(awk -F, 'NR>1 && $2+0 > max {max=$2+0} END {print max+0}' "$STATS_LOG" 2>/dev/null || echo "?")
AVG_MEM_PER=$(awk -F, 'NR>1 && $4+0 > 0 {sum+=$4; n++} END {printf "%.0f", (n>0 ? sum/n : 0)}' "$STATS_LOG" 2>/dev/null || echo "?")
PEAK_CPU=$(awk -F, 'NR>1 && $6+0 > max {max=$6+0} END {printf "%.0f", max}' "$STATS_LOG" 2>/dev/null || echo "?")

PASSED=$(grep -oE '[0-9]+/[0-9]+ test cases passed' "$SEED_LOG" 2>/dev/null || echo "unknown")
UNEXPECTED=$(grep -c 'UNEXPECTED' "$SEED_LOG" 2>/dev/null || echo 0)

cat > "$SUMMARY" <<EOF
==========================================
 Seed Performance Report
==========================================
 Generator:       $GENERATOR
 Parallel:        $PARALLEL
 Skip scripts:    $([[ -n "$SKIP_SCRIPTS" ]] && echo yes || echo no)
 Total fixtures:  $FIXTURE_COUNT
 Exit code:       $EXIT_CODE
------------------------------------------
 Wall clock:      ${ELAPSED}s ($(( ELAPSED / 60 ))m $(( ELAPSED % 60 ))s)
 Result:          $PASSED
 Unexpected:      $UNEXPECTED failures
------------------------------------------
$PHASE_SUMMARY
------------------------------------------
 Docker Resources (peak):
   Containers:      $PEAK_CONTAINERS
   Memory:          ${PEAK_MEM} GiB (avg ${AVG_MEM_PER}M per container)
   CPU:             ${PEAK_CPU}%
==========================================
 Full log:    $SEED_LOG
 Profile:     $PROFILE_LOG
 Stats CSV:   $STATS_LOG
 Summary:     $SUMMARY
==========================================
EOF

cat "$SUMMARY"

exit $EXIT_CODE
