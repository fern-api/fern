#!/bin/bash
#
# Claude Code WorktreeCreate hook.
# Creates a worktree with sparse checkout in ../.fern-worktrees/.
#
# Stdin: JSON with session_id, cwd, worktreeInput.branch, etc.
# Stdout: Must be ONLY the absolute worktree path (nothing else).
#

set -e

INPUT=$(cat)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKTREE_BASE="$REPO_ROOT/../.fern-worktrees"

# Extract branch from worktreeInput if provided (e.g. claude --worktree username/my-branch)
BRANCH=$(echo "$INPUT" | jq -r '.worktreeInput.branch // empty')

if [ -n "$BRANCH" ]; then
    # Use the branch name as the worktree directory name (slashes become directory separators)
    WORKTREE_NAME="$BRANCH"
else
    # Fallback: generate a worktree name from timestamp + random suffix
    WORKTREE_NAME="wt-$(date +%s)-$$"
fi

WORKTREE_PATH="$WORKTREE_BASE/$WORKTREE_NAME"

mkdir -p "$WORKTREE_BASE"

# Create worktree — use -b if the branch doesn't exist yet
if [ -n "$BRANCH" ]; then
    if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
        git worktree add "$WORKTREE_PATH" "$BRANCH" >/dev/null 2>&1
    else
        git worktree add -b "$BRANCH" "$WORKTREE_PATH" >/dev/null 2>&1
    fi
else
    git worktree add "$WORKTREE_PATH" >/dev/null 2>&1
fi

# Apply sparse checkout (suppress all output)
bash "$SCRIPT_DIR/sparse-checkout.sh" "$WORKTREE_PATH" >/dev/null 2>&1

# Print ONLY the absolute path — Claude Code parses this
echo "$WORKTREE_PATH"
