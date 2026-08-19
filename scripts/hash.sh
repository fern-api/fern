#!/bin/bash

# hash.sh
#
# Hash directory contents using git's object store, with optional pattern exclusions.
#
# Usage: ./hash.sh [--exclude PATTERN]... PATH...
# Example: ./hash.sh --exclude "*.md" --exclude "*.test.js" src/ tests/

paths=()
exclude_paths=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --exclude)
            exclude_paths+=("$2")
            shift 2
            ;;
        *)
            paths+=("$1")
            shift
            ;;
    esac
done

# We must be in a git repository to compute hashes.
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository" >&2
    exit 1
fi

# Create exclude pattern string for grep.
exclude_pattern=""
for pattern in "${exclude_paths[@]}"; do
    grep_pattern=$(echo "$pattern" | sed 's/\./\\./g' | sed 's/\*/.*/')
    if [ -n "$exclude_pattern" ]; then
        exclude_pattern="$exclude_pattern|$grep_pattern"
    else
        exclude_pattern="$grep_pattern"
    fi
done

# List files and compute hash.
if [ ${#paths[@]} -eq 0 ]; then
    echo "Error: No paths specified" >&2
    exit 1
fi

# Generate a hash based on the tracked files.
if [ -n "$exclude_pattern" ]; then
    git ls-files -z "${paths[@]}" | tr '\0' '\n' | grep -vE "$exclude_pattern" | sort | xargs git hash-object | git hash-object --stdin
else
    git ls-files -z "${paths[@]}" | tr '\0' '\n' | sort | xargs git hash-object | git hash-object --stdin
fi