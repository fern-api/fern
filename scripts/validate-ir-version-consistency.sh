#!/bin/bash

# Script to validate that the irVersion in each seed.yml matches the irVersion
# of the latest release in the corresponding versions.yml file.
#
# Usage: ./validate-ir-version-consistency.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=()

# Function to extract irVersion from seed.yml
get_seed_ir_version() {
    local seed_file="$1"
    # Extract irVersion value, removing the 'v' prefix if present
    grep -E "^irVersion:" "$seed_file" | head -1 | sed 's/irVersion:[[:space:]]*//' | sed 's/^v//'
}

# Function to get the irVersion of the latest version from versions.yml
# This includes RC versions since seed tests should match the current generator state
get_latest_release_ir_version() {
    local versions_file="$1"
    
    # Use awk to find the first version entry and extract its irVersion
    awk '
    BEGIN { in_version_block = 0 }
    /^- version:/ {
        in_version_block = 1
    }
    /^[[:space:]]+irVersion:/ && in_version_block {
        ir = $0
        gsub(/^[[:space:]]+irVersion:[[:space:]]*/, "", ir)
        print ir
        exit
    }
    ' "$versions_file"
}

# Function to get the latest version string from versions.yml (for error messages)
get_latest_release_version() {
    local versions_file="$1"
    
    awk '
    /^- version:/ {
        version = $0
        gsub(/^- version:[[:space:]]*/, "", version)
        print version
        exit
    }
    ' "$versions_file"
}

echo "Validating irVersion consistency between seed.yml and versions.yml files..."
echo ""

# Find all seed.yml files
for seed_file in "$REPO_ROOT"/seed/*/seed.yml; do
    if [ ! -f "$seed_file" ]; then
        continue
    fi
    
    seed_dir=$(dirname "$seed_file")
    seed_name=$(basename "$seed_dir")
    
    # Get changelogLocation from seed.yml
    changelog_location=$(grep -E "^changelogLocation:" "$seed_file" | head -1 | sed 's/changelogLocation:[[:space:]]*//' || true)
    
    if [ -z "$changelog_location" ]; then
        echo -e "${YELLOW}SKIP${NC} $seed_name: No changelogLocation specified"
        continue
    fi
    
    # Resolve the versions.yml path relative to the seed.yml file
    versions_file="$seed_dir/$changelog_location"
    
    if [ ! -f "$versions_file" ]; then
        echo -e "${YELLOW}SKIP${NC} $seed_name: versions.yml not found at $versions_file"
        continue
    fi
    
    # Get irVersion from seed.yml
    seed_ir_version=$(get_seed_ir_version "$seed_file")
    
    if [ -z "$seed_ir_version" ]; then
        echo -e "${YELLOW}SKIP${NC} $seed_name: No irVersion in seed.yml"
        continue
    fi
    
    # Get irVersion from the latest release in versions.yml
    versions_ir_version=$(get_latest_release_ir_version "$versions_file")
    
    if [ -z "$versions_ir_version" ]; then
        echo -e "${YELLOW}SKIP${NC} $seed_name: Could not find irVersion in versions.yml"
        continue
    fi
    
    # Compare the versions
    if [ "$seed_ir_version" = "$versions_ir_version" ]; then
        echo -e "${GREEN}PASS${NC} $seed_name: irVersion $seed_ir_version matches"
    else
        latest_version=$(get_latest_release_version "$versions_file")
        echo -e "${RED}FAIL${NC} $seed_name: seed.yml has irVersion v$seed_ir_version but latest release ($latest_version) has irVersion $versions_ir_version"
        errors+=("$seed_name: seed.yml has irVersion v$seed_ir_version but latest release ($latest_version) has irVersion $versions_ir_version")
    fi
done

echo ""

if [ ${#errors[@]} -gt 0 ]; then
    echo -e "${RED}Validation failed with ${#errors[@]} error(s):${NC}"
    echo ""
    for error in "${errors[@]}"; do
        echo "  - $error"
    done
    echo ""
    echo "To fix: Update the irVersion in the seed.yml file to match the irVersion"
    echo "of the latest release in the corresponding versions.yml file."
    exit 1
fi

echo -e "${GREEN}All irVersion checks passed!${NC}"
