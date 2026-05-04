#!/bin/bash
#
# Claude Code WorktreeCreate hook.
# Creates a worktree with sparse checkout in ../.fern-worktrees/.
#
# Stdin: JSON with session_id, cwd, name, etc.
# Stdout: Must be ONLY the absolute worktree path (nothing else).
#

set -e

INPUT=$(cat)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKTREE_BASE="$REPO_ROOT/../.fern-worktrees"

# Extract the worktree name (e.g. claude --worktree my-special-worktree)
NAME=$(echo "$INPUT" | jq -r '.name // empty')

if [ -n "$NAME" ]; then
    WORKTREE_NAME="$NAME"
else
    # Fallback: generate a worktree name from timestamp + random suffix
    WORKTREE_NAME="wt-$(date +%s)-$$"
fi

WORKTREE_PATH="$WORKTREE_BASE/$WORKTREE_NAME"

mkdir -p "$WORKTREE_BASE"

# Create the worktree (suppress all output)
git worktree add "$WORKTREE_PATH" >/dev/null 2>&1

# Apply sparse checkout (suppress all output)
bash "$SCRIPT_DIR/sparse-checkout.sh" "$WORKTREE_PATH" >/dev/null 2>&1

# Print ONLY the absolute path — Claude Code parses this
echo "$WORKTREE_PATH"
