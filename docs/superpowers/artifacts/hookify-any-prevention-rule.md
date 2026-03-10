# Hookify Rule: TypeScript `any` Type Prevention

## What This Rule Does

A Claude Code PreToolUse hook that intercepts all file edit and write operations targeting TypeScript files (`.ts`, `.tsx`) and blocks them if the new content contains usage of the `any` type.

When triggered, Claude receives an error message explaining the violation and suggesting alternatives like `unknown`, specific types, or generic type parameters.

## CLAUDE.md Rule Enforced

> **Never use `any`.** If the type is truly unknown, use `unknown` and narrow it with type guards. If you're tempted to use `any`, stop and find the correct type or create one.

## How It Works

The hook is registered as a **PreToolUse** hook on the `Edit`, `MultiEdit`, and `Write` tools in `.claude/settings.json`:

```json
"PreToolUse": [
  {
    "matcher": "Edit|MultiEdit|Write",
    "hooks": [
      {
        "type": "command",
        "command": "bash .claude/hooks/prevent-any-type.sh"
      }
    ]
  }
]
```

The script (`.claude/hooks/prevent-any-type.sh`) receives the tool input as JSON on stdin and:

1. **Extracts the file path** and checks if it targets a `.ts` or `.tsx` file
2. **Skips generated/vendored paths** (e.g., `/generated/`, `/dist/`, `/ir-sdk/src/sdk/`)
3. **Extracts the content** being written or edited (handles Write, Edit, and MultiEdit tools)
4. **Scans for `any` type patterns** using regex — `: any`, `<any>`, `as any`, `any[]`, etc.
5. **Filters out false positives** — excludes comments (`//`, `*`)
6. **Exits with code 2** (blocking the tool call) if violations found, or code 0 if clean

## Example: What It Catches

If Claude attempts to write:

```typescript
export function parseResponse(data: any): string {
  return data.name;
}
```

The hook blocks the operation and outputs:

```
HOOK_ERROR: TypeScript `any` type detected in src/utils/parser.ts

CLAUDE.md rule: "Never use `any`. If the type is truly unknown,
use `unknown` and narrow it with type guards."

Detected `any` usage:
1:export function parseResponse(data: any): string {

Suggested alternatives:
  - Use `unknown` and narrow with type guards
  - Use a specific type or interface
  - Use `Record<string, unknown>` instead of `Record<string, any>`
  - Use generic type parameters
```

## Files

- **Hook script**: `.claude/hooks/prevent-any-type.sh`
- **Hook registration**: `.claude/settings.json` (under `hooks.PreToolUse`)
