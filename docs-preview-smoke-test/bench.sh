#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/fern"
PAGES="/welcome /rest-api/add-plant /rest-api/get-plant-by-id /sitemap.xml"
WELCOME=docs/pages/welcome.mdx
tree_pids(){ local p=$1; echo $p; for c in $(pgrep -P $p); do tree_pids $c; done; }
run(){ # name args port cachedir mode
  local name=$1 args=$2 port=$3 cache=$4 mode=$5; local log=/tmp/bench-$name-$mode.log
  [[ $mode == cold ]] && rm -rf "$cache"
  local t0=$(date +%s.%N)
  setsid npx -y fern-api@5.148.2 docs dev $args --port $port >$log 2>&1 &
  local root=$!
  local peakf=/tmp/peak-$name-$mode; echo 0 > $peakf
  while ! grep -q "ready on" $log; do
    sleep 0.5; kill -0 $root 2>/dev/null || { echo "$name died"; tail -5 $log; return; }
    (( $(echo "$(date +%s.%N) - $t0 > 300" | bc) )) && { echo "$name timeout"; return; }
  done
  local ready=$(printf "%.1f" $(echo "$(date +%s.%N) - $t0" | bc))
  sample(){ local r=0 c=0; for p in $(tree_pids $root); do read rs cp < <(ps -o rss=,%cpu= -p $p 2>/dev/null || echo "0 0"); r=$((r+rs)); c=$(echo "$c+$cp"|bc); done; [[ $r -gt $(cat $peakf) ]] && echo $r > $peakf; echo "$r $c"; }
  sleep 2; read idle_rss idle_cpu < <(sample)
  # TTFB: 1st (cold render) and 3rd request
  local ttfb=""
  for p in $PAGES; do
    local a b
    a=$(curl -s -o /dev/null -w "%{time_starttransfer}" http://localhost:$port$p)
    curl -s -o /dev/null http://localhost:$port$p
    b=$(curl -s -o /dev/null -w "%{time_starttransfer}" http://localhost:$port$p)
    ttfb+="$p first=$(printf %.0f $(echo "$a*1000"|bc))ms warm=$(printf %.0f $(echo "$b*1000"|bc))ms; "
    sample >/dev/null
  done
  # edit -> reload latency (poll until marker rendered)
  cp $WELCOME /tmp/w.bak; local m=BENCH_$(date +%s%N); local e0=$(date +%s.%N)
  printf "\n%s\n" $m >> $WELCOME
  local reload=timeout; for i in $(seq 1 600); do curl -s http://localhost:$port/welcome | grep -q $m && { reload=$(printf "%.1fs" $(echo "$(date +%s.%N) - $e0"|bc)); break; }; sleep 0.1; sample >/dev/null; done
  cp /tmp/w.bak $WELCOME; sleep 3; sample >/dev/null
  # load burst: 40 requests to welcome, measure cpu during
  local l0=$(date +%s.%N); local pids=(); for i in $(seq 1 40); do curl -s -o /dev/null http://localhost:$port/welcome & pids+=($!); done; wait "${pids[@]}"; local burst=$(printf "%.1fs" $(echo "$(date +%s.%N) - $l0"|bc))
  read post_rss post_cpu < <(sample)
  local disk=$(du -sm "$cache" 2>/dev/null | cut -f1)
  echo "RESULT $name/$mode: ready=${ready}s idle_rss=$((idle_rss/1024))MB peak_rss=$(( $(cat $peakf)/1024 ))MB post_rss=$((post_rss/1024))MB reload=$reload burst40=$burst bundle_disk=${disk}MB"
  echo "  ttfb: $ttfb"
  kill -- -$(ps -o pgid= $root | tr -d ' ') 2>/dev/null; sleep 2
}
run next ""        3460 ~/.fern/app-preview       cold
run next ""        3460 ~/.fern/app-preview       warm
run astro "--astro" 3461 ~/.fern/astro-preview cold
run astro "--astro" 3461 ~/.fern/astro-preview warm
