#!/usr/bin/env bash
set -euo pipefail

# Seed performance profiler — runs seed test with --profile and Docker stats monitoring
# Usage: scripts/seed-perf.sh <generator> [--parallel N] [--with-scripts] [--interval N]

GENERATOR="${1:?Usage: $0 <generator> [--parallel N] [--with-scripts] [--interval N]}"
shift

PARALLEL=32
SKIP_SCRIPTS="--skip-scripts"
LOG_LEVEL="info"
SAMPLE_INTERVAL=5

while [[ $# -gt 0 ]]; do
    case "$1" in
        --parallel) PARALLEL="$2"; shift 2 ;;
        --with-scripts) SKIP_SCRIPTS=""; shift ;;
        --log-level) LOG_LEVEL="$2"; shift 2 ;;
        --interval) SAMPLE_INTERVAL="$2"; shift 2 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

REPORT_DIR="/tmp/seed-perf-$$"
mkdir -p "$REPORT_DIR"
SEED_LOG="$REPORT_DIR/seed.log"
PROFILE_LOG="$REPORT_DIR/profile.jsonl"
STATS_LOG="$REPORT_DIR/stats.csv"
SUMMARY="$REPORT_DIR/summary.txt"

echo "==========================================="
echo " Seed Performance Profiler"
echo "==========================================="
echo " Generator:       $GENERATOR"
echo " Parallel:        $PARALLEL"
echo " Skip scripts:    $([[ -n "$SKIP_SCRIPTS" ]] && echo yes || echo no)"
echo " Sample interval: ${SAMPLE_INTERVAL}s"
echo " Report dir:      $REPORT_DIR"
echo "==========================================="
echo ""

# Get fixture count
FIXTURE_COUNT=$(node --enable-source-maps packages/seed/dist/cli.cjs list-test-fixtures \
    --generator "$GENERATOR" --groups 1 2>/dev/null \
    | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d[0].get('fixtures',[])))" 2>/dev/null || echo "?")
echo "Total test cases: $FIXTURE_COUNT"
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

# --- Profile file tailer for live progress (background) ---
monitor_profile() {
    local completed=0 in_flight_phases=""
    local -A active_phases  # phase -> count of in-flight

    # Wait for profile file to exist
    while [[ ! -f "$PROFILE_LOG" ]]; do sleep 1; done

    tail -f "$PROFILE_LOG" 2>/dev/null | while IFS= read -r line; do
        local event phase
        event=$(echo "$line" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('event',''))" 2>/dev/null || continue)
        phase=$(echo "$line" | python3 -c "import json,sys; print(json.loads(sys.stdin.read()).get('phase',''))" 2>/dev/null || continue)

        if [[ "$event" == "start" ]]; then
            active_phases[$phase]=$(( ${active_phases[$phase]:-0} + 1 ))
        elif [[ "$event" == "end" ]]; then
            local current=${active_phases[$phase]:-0}
            if (( current > 0 )); then
                active_phases[$phase]=$(( current - 1 ))
            fi
            if [[ "$phase" == "total" ]]; then
                completed=$((completed + 1))
            fi
        fi

        # Build in-flight summary
        in_flight_phases=""
        local total_in_flight=0
        for p in "${!active_phases[@]}"; do
            local c=${active_phases[$p]}
            if (( c > 0 )); then
                total_in_flight=$((total_in_flight + c))
                if [[ -n "$in_flight_phases" ]]; then
                    in_flight_phases="$in_flight_phases, $p: $c"
                else
                    in_flight_phases="$p: $c"
                fi
            fi
        done

        # Read latest docker stats line
        local mem_gib containers
        containers=$(tail -1 "$STATS_LOG" 2>/dev/null | awk -F, 'NR==1 && NF>1 {print $2}' || echo "?")
        mem_gib=$(tail -1 "$STATS_LOG" 2>/dev/null | awk -F, 'NR==1 && NF>1 {printf "%.1f", $3/1024}' || echo "?")
        local docker_limit
        docker_limit=$(docker info --format '{{.MemTotal}}' 2>/dev/null | awk '{printf "%.0f", $1/1073741824}' || echo '?')

        printf "\r  [done: %3d/%s] containers: %s | mem: %s/%s GiB | in-flight: %d (%s)          " \
            "$completed" "$FIXTURE_COUNT" \
            "$containers" "$mem_gib" "$docker_limit" \
            "$total_in_flight" "$in_flight_phases" 2>/dev/null
    done
}

# --- Run seed test ---
echo "Starting seed test..."
echo ""

START_TIME=$SECONDS

monitor_docker_stats &
DOCKER_MONITOR_PID=$!

monitor_profile &
PROFILE_MONITOR_PID=$!

cleanup() {
    kill "$DOCKER_MONITOR_PID" 2>/dev/null || true
    kill "$PROFILE_MONITOR_PID" 2>/dev/null || true
    wait "$DOCKER_MONITOR_PID" 2>/dev/null || true
    wait "$PROFILE_MONITOR_PID" 2>/dev/null || true
    echo ""
}
trap cleanup EXIT

pnpm seed test \
    --generator "$GENERATOR" \
    --parallel "$PARALLEL" \
    --log-level "$LOG_LEVEL" \
    --profile "$PROFILE_LOG" \
    $SKIP_SCRIPTS \
    > "$SEED_LOG" 2>&1
EXIT_CODE=$?

END_TIME=$SECONDS
ELAPSED=$((END_TIME - START_TIME))

# Kill monitors
kill "$DOCKER_MONITOR_PID" 2>/dev/null || true
kill "$PROFILE_MONITOR_PID" 2>/dev/null || true
wait "$DOCKER_MONITOR_PID" 2>/dev/null || true
wait "$PROFILE_MONITOR_PID" 2>/dev/null || true
trap - EXIT
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
