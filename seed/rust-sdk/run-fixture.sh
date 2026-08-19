#!/bin/bash
passing=()
failing=()

for dir in */; do
  if [ -f "${dir}Cargo.toml" ]; then
    fixture_name="${dir%/}"
    echo "Checking: $fixture_name" >&2
    if (cd "$dir" && cargo check --quiet 2>&1 > /dev/null); then
      passing+=("$fixture_name")
    else
      failing+=("$fixture_name")
    fi
  fi
done

echo ""
echo "=== SUMMARY ==="
echo "Total fixtures: $((${#passing[@]} + ${#failing[@]}))"
echo "Passing: ${#passing[@]}"
echo "Failing: ${#failing[@]}"
echo ""
echo "=== PASSING FIXTURES ==="
printf '%s\n' "${passing[@]}"
echo ""
echo "=== FAILING FIXTURES ==="
printf '%s\n' "${failing[@]}"