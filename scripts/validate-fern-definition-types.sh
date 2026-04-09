#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FERN_DEF_DIR="$REPO_ROOT/fern/apis/fern-definition/definition"
TS_TYPES_DIR="$REPO_ROOT/packages/cli/fern-definition/schema/src/schemas/api/resources"
TS_SERDE_DIR="$REPO_ROOT/packages/cli/fern-definition/schema/src/schemas/serialization/resources"

EXIT_CODE=0

echo "=== Validating Fern Definition / TypeScript Type Consistency ==="
echo ""

# 1. Check that no 'optional<' is used in the Fern definition (should be 'nullable<')
echo "--- Checking for 'optional<' in Fern definition ---"
if grep -rn 'optional<' "$FERN_DEF_DIR" --include='*.yml'; then
    echo ""
    echo "ERROR: Found 'optional<' in Fern definition files."
    echo "       Use 'nullable<' instead of 'optional<'."
    EXIT_CODE=1
else
    echo "OK: No 'optional<' found in Fern definition."
fi
echo ""

# 2. Check that no '?: ' (optional property) exists in the generated TS API types
echo "--- Checking for '?' (optional/undefined) in generated TypeScript API types ---"
OPTIONAL_IN_TS=false
for dir in "$TS_TYPES_DIR"/*/types; do
    if [ -d "$dir" ]; then
        if grep -rn '?: ' "$dir" --include='*.ts'; then
            OPTIONAL_IN_TS=true
        fi
    fi
done

if [ "$OPTIONAL_IN_TS" = true ]; then
    echo ""
    echo "ERROR: Found '?' (optional/undefined) properties in generated TypeScript API types."
    echo "       Properties should use '| null' instead of '?'."
    EXIT_CODE=1
else
    echo "OK: No optional (undefined) properties found in generated TypeScript API types."
fi
echo ""

# 3. Check that no '| undefined' exists in the generated TS API types
#    Exclude Record<> values and array element types (from list<unknown> patterns)
echo "--- Checking for '| undefined' in generated TypeScript API types ---"
UNDEFINED_IN_TS=false
for dir in "$TS_TYPES_DIR"/*/types; do
    if [ -d "$dir" ]; then
        if grep -rn '| undefined' "$dir" --include='*.ts' | grep -v 'Record<' | grep -v '\| undefined)\[\]'; then
            UNDEFINED_IN_TS=true
        fi
    fi
done

if [ "$UNDEFINED_IN_TS" = true ]; then
    echo ""
    echo "ERROR: Found '| undefined' in generated TypeScript API types."
    echo "       Properties should use '| null' instead of '| undefined'."
    EXIT_CODE=1
else
    echo "OK: No '| undefined' found in generated TypeScript API types."
fi
echo ""

# 4. Check that serialization schemas use .nullable() not .optional()
echo "--- Checking for '.optional()' in serialization schemas ---"
OPTIONAL_IN_SERDE=false
for dir in "$TS_SERDE_DIR"/*/types; do
    if [ -d "$dir" ]; then
        if grep -rn '\.optional()' "$dir" --include='*.ts'; then
            OPTIONAL_IN_SERDE=true
        fi
    fi
done

if [ "$OPTIONAL_IN_SERDE" = true ]; then
    echo ""
    echo "ERROR: Found '.optional()' in serialization schemas."
    echo "       Use '.nullable()' instead of '.optional()'."
    EXIT_CODE=1
else
    echo "OK: No '.optional()' found in serialization schemas."
fi
echo ""

# 5. Check that the Fern definition uses 'nullable<' for all nullable types
echo "--- Checking 'nullable<' is used in Fern definition ---"
NULLABLE_COUNT=$(grep -rc 'nullable<' "$FERN_DEF_DIR" --include='*.yml' | awk -F: '{sum+=$2} END{print sum}')
echo "Found $NULLABLE_COUNT nullable<> usages in Fern definition."
echo ""

echo "================================"
if [ "$EXIT_CODE" -eq 0 ]; then
    echo "All checks passed!"
else
    echo "FAILED: Some checks did not pass. See errors above."
fi
echo "================================"

exit $EXIT_CODE
