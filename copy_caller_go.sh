#!/bin/bash

# Source file path
SOURCE_FILE="generators/go/internal/testdata/sdk/auth/fixtures/internal/caller.go"

# Check if source file exists
if [[ ! -f "$SOURCE_FILE" ]]; then
    echo "Error: Source file '$SOURCE_FILE' not found!"
    exit 1
fi

# Find all target files matching the pattern seed/go-sdk/**/internal/caller.go
TARGET_FILES=$(find seed/go-sdk -name "caller.go" -path "*/internal/caller.go" 2>/dev/null)

if [[ -z "$TARGET_FILES" ]]; then
    echo "No target files found matching pattern seed/go-sdk/**/internal/caller.go"
    exit 1
fi

# Count total files
TOTAL_FILES=$(echo "$TARGET_FILES" | wc -l)
echo "Found $TOTAL_FILES target files to update"
echo

# Copy source file contents to each target file
UPDATED_COUNT=0
FAILED_COUNT=0

while IFS= read -r target_file; do
    echo "Updating: $target_file"

    # Copy source file to target file
    if cp "$SOURCE_FILE" "$target_file"; then
        ((UPDATED_COUNT++))
        echo "  ✓ Successfully updated"
    else
        ((FAILED_COUNT++))
        echo "  ✗ Failed to update"
    fi
done <<< "$TARGET_FILES"

echo
echo "Summary:"
echo "  Total files found: $TOTAL_FILES"
echo "  Successfully updated: $UPDATED_COUNT"
echo "  Failed to update: $FAILED_COUNT"

if [[ $FAILED_COUNT -eq 0 ]]; then
    echo
    echo "All files updated successfully!"
    exit 0
else
    echo
    echo "Some files failed to update. Please check the errors above."
    exit 1
fi
