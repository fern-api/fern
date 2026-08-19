#!/usr/bin/env bash
# Generates versioned docs configuration at CI time for multi-version benchmarking.
# Mimics a real customer setup where docs are published across
# many API versions, each with its own OpenAPI spec and shared markdown pages.
#
# This script:
# 1. Scans apis/square-*/ for downloaded historical specs
# 2. Creates a generators.yml for each versioned API workspace
# 3. Creates a version file (versions/vYYYY-MM-DD.yml) for each version
# 4. Overwrites docs.yml with versioned configuration
#
# Usage: generate-fixture-versions.sh [page-count]
#   page-count: Number of pages per version (must match generate-fixture-pages.sh output)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSIONS_DIR="${SCRIPT_DIR}/versions"
APIS_DIR="${SCRIPT_DIR}/apis"
DOCS_YML="${SCRIPT_DIR}/docs.yml"
PAGE_COUNT="${1:-37}"

# Clean any previous version artifacts
rm -rf "$VERSIONS_DIR"
mkdir -p "$VERSIONS_DIR"

# Discover downloaded versioned specs (square-YYYY-MM-DD directories with openapi.json)
FOUND_VERSIONS=()
for spec_dir in "${APIS_DIR}"/square-*/; do
  [ -d "$spec_dir" ] || continue
  if [ -f "${spec_dir}openapi.json" ]; then
    # Extract version label from directory name (e.g., "2025-10-16" from "square-2025-10-16")
    DIR_NAME=$(basename "$spec_dir")
    VERSION="${DIR_NAME#square-}"
    FOUND_VERSIONS+=("$VERSION")
  fi
done

if [ ${#FOUND_VERSIONS[@]} -eq 0 ]; then
  echo "No versioned specs found in ${APIS_DIR}/square-*/. Skipping version generation."
  echo "docs.yml will remain in unversioned (flat navigation) mode."
  exit 0
fi

# Sort versions newest-first (lexicographic sort works for YYYY-MM-DD format)
IFS=$'\n' SORTED_VERSIONS=($(printf '%s\n' "${FOUND_VERSIONS[@]}" | sort -r)); unset IFS

echo "Found ${#SORTED_VERSIONS[@]} versioned specs. Generating fixture versions..."

# Generate generators.yml for each versioned API workspace
for VERSION in "${SORTED_VERSIONS[@]}"; do
  GEN_YML="${APIS_DIR}/square-${VERSION}/generators.yml"
  if [ ! -f "$GEN_YML" ]; then
    cat > "$GEN_YML" <<'EOF'
api:
  specs:
    - openapi: ./openapi.json
EOF
  fi
done

# Generate version files — each version references the same pages + its own API workspace
for VERSION in "${SORTED_VERSIONS[@]}"; do
  VERSION_FILE="${VERSIONS_DIR}/v${VERSION}.yml"

  {
    echo "navigation:"

    # Section: Getting Started (pages 1-5)
    echo "  - section: Getting Started"
    echo "    contents:"
    for i in $(seq 1 5); do
      PAGE_NUM=$(printf "%02d" "$i")
      echo "      - page: Page ${PAGE_NUM}"
      echo "        path: ../pages/page-${PAGE_NUM}.md"
    done

    # Section: Core Concepts (pages 6-14)
    echo "  - section: Core Concepts"
    echo "    contents:"
    for i in $(seq 6 14); do
      PAGE_NUM=$(printf "%02d" "$i")
      echo "      - page: Page ${PAGE_NUM}"
      echo "        path: ../pages/page-${PAGE_NUM}.md"
    done

    # Section: Guides (pages 15-24)
    echo "  - section: Guides"
    echo "    contents:"
    for i in $(seq 15 24); do
      PAGE_NUM=$(printf "%02d" "$i")
      echo "      - page: Page ${PAGE_NUM}"
      echo "        path: ../pages/page-${PAGE_NUM}.md"
    done

    # Section: Platform (pages 25-32)
    echo "  - section: Platform"
    echo "    contents:"
    for i in $(seq 25 32); do
      PAGE_NUM=$(printf "%02d" "$i")
      echo "      - page: Page ${PAGE_NUM}"
      echo "        path: ../pages/page-${PAGE_NUM}.md"
    done

    # Section: Resources (pages 33-PAGE_COUNT)
    echo "  - section: Resources"
    echo "    contents:"
    for i in $(seq 33 "$PAGE_COUNT"); do
      PAGE_NUM=$(printf "%02d" "$i")
      echo "      - page: Page ${PAGE_NUM}"
      echo "        path: ../pages/page-${PAGE_NUM}.md"
    done

    # API Reference pointing to this version's workspace
    echo "  - api: API Reference"
    echo "    api-name: square-${VERSION}"
  } > "$VERSION_FILE"
done

# Generate docs.yml with versioned configuration
{
  cat <<EOF
# Auto-generated at CI time by generate-fixture-versions.sh.
# Do not edit manually — changes will be overwritten during benchmark runs.
#
# Mimics a real customer docs setup with ${#SORTED_VERSIONS[@]} API versions,
# each with its own OpenAPI spec and shared markdown pages.
instances:
  - url: fern.docs.buildwithfern.com

versions:
EOF

  for VERSION in "${SORTED_VERSIONS[@]}"; do
    echo "  - display-name: \"${VERSION}\""
    echo "    path: ./versions/v${VERSION}.yml"
  done

  cat <<EOF

colors:
  accentPrimary: "#818CF8"
  background: "#0F172A"
EOF
} > "$DOCS_YML"

echo "Generated ${#SORTED_VERSIONS[@]} version files in ${VERSIONS_DIR}/"
echo "Generated docs.yml with ${#SORTED_VERSIONS[@]} versions"
