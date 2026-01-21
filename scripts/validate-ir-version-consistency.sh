#!/bin/bash

# Validate that irVersion in seed.yml matches irVersion of latest release in versions.yml

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

errors=()

# Extract irVersion from seed.yml
get_seed_ir_version() {
    grep -E "^irVersion:" "$1" | head -1 | sed 's/irVersion:[[:space:]]*v\{0,1\}//'
}

# Extract irVersion from first version entry in versions.yml
get_versions_ir_version() {
    awk '/^- version:/{found=1; next} found && /^[[:space:]]+irVersion:/{gsub(/^[[:space:]]+irVersion:[[:space:]]*/, ""); print; exit}' "$1"
}

# Extract version string from first version entry in versions.yml
get_latest_version() {
    awk '/^- version:/{gsub(/^- version:[[:space:]]*/, ""); print; exit}' "$1"
}

for seed_file in "$REPO_ROOT"/seed/*/seed.yml; do
    [ -f "$seed_file" ] || continue

    seed_dir=$(dirname "$seed_file")
    seed_name=$(basename "$seed_dir")

    # Skip deprecated generators
    case "$seed_name" in
        ruby-model|ruby-sdk)
            continue
            ;;
    esac

    # Get changelogLocation and resolve versions.yml path
    changelog_location=$(grep -E "^changelogLocation:" "$seed_file" | head -1 | sed 's/changelogLocation:[[:space:]]*//' || true)
    [ -n "$changelog_location" ] || continue

    versions_file="$seed_dir/$changelog_location"
    [ -f "$versions_file" ] || continue

    # Get irVersion from both files
    seed_ir_version=$(get_seed_ir_version "$seed_file")
    versions_ir_version=$(get_versions_ir_version "$versions_file")

    [ -n "$seed_ir_version" ] && [ -n "$versions_ir_version" ] || continue

    # Compare versions
    if [ "$seed_ir_version" != "$versions_ir_version" ]; then
        latest_version=$(get_latest_version "$versions_file")
        errors+=("$seed_name: seed.yml has irVersion $seed_ir_version but latest release ($latest_version) has irVersion $versions_ir_version")
    fi
done

if [ ${#errors[@]} -gt 0 ]; then
    echo "IR version consistency validation failed:"
    printf '  - %s\n' "${errors[@]}"
    echo ""
    echo "Fix: Update irVersion in seed.yml to match the latest release in versions.yml"
    exit 1
fi

echo "All IR versions are consistent"