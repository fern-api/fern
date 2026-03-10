#\!/usr/bin/env bash
#
# PreToolUse hook: Prevents writing TypeScript code containing the `any` type.
# Enforces CLAUDE.md rule: "Never use `any`. If the type is truly unknown,
# use `unknown` and narrow it with type guards."
#
# Receives tool input as JSON on stdin. Checks the content being written
# for `any` type usage in TypeScript files (.ts, .tsx).

set -euo pipefail

INPUT=$(cat)

# Extract file path from the tool input
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only check TypeScript files
if [[ -z "$FILE_PATH" ]] || \! echo "$FILE_PATH" | grep -qE '\.(ts|tsx)$'; then
  exit 0
fi

# Skip generated/vendored files that may legitimately use any
if echo "$FILE_PATH" | grep -qE '(\/generated\/|\/dist\/|\/build\/|\/node_modules\/|\.generated\.|\/ir-sdk\/src\/sdk\/)'; then
  exit 0
fi

# Determine the content to check based on the tool type
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [[ "$TOOL_NAME" == "Write" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
elif [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "MultiEdit" ]]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
  # For MultiEdit, also check all edits
  if [[ -z "$CONTENT" ]]; then
    CONTENT=$(echo "$INPUT" | jq -r '[.tool_input.edits[]?.new_string // empty] | join("\n")' 2>/dev/null || echo "")
  fi
else
  exit 0
fi

if [[ -z "$CONTENT" ]]; then
  exit 0
fi

# Check for `any` type usage patterns in TypeScript code
# Matches: : any, <any>, as any, any[], any>, extends any, & any, | any
# Excludes: words containing "any" (e.g., "company", "many", "anyOf")
MATCHES=$(echo "$CONTENT" | grep -nE '(:\s*any\b|<any\b|as\s+any\b|\bany\s*\[|\bany\s*>|\bextends\s+any\b|[&|]\s*any\b|\bRecord<[^,]+,\s*any\b|\bArray<any\b|\bPromise<any\b)' | grep -vE '^\s*//' | grep -vE '^\s*\*' | grep -vE '//.*any' || true)

if [[ -n "$MATCHES" ]]; then
  echo "HOOK_ERROR: TypeScript \`any\` type detected in $FILE_PATH"
  echo ""
  echo "CLAUDE.md rule: \"Never use \`any\`. If the type is truly unknown,"
  echo "use \`unknown\` and narrow it with type guards.\""
  echo ""
  echo "Detected \`any\` usage:"
  echo "$MATCHES"
  echo ""
  echo "Suggested alternatives:"
  echo "  - Use \`unknown\` and narrow with type guards"
  echo "  - Use a specific type or interface"
  echo "  - Use \`Record<string, unknown>\` instead of \`Record<string, any>\`"
  echo "  - Use generic type parameters"
  exit 2
fi

exit 0
