#!/bin/bash
#
# Creates a git worktree with sparse checkout pre-configured.
#
# Usage:
#   bash scripts/worktree-add.sh <branch>          # creates at ../.fern-worktrees/<branch>
#   bash scripts/worktree-add.sh <branch> <path>    # creates at <path>
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKTREE_BASE="$REPO_ROOT/../.fern-worktrees"

branch="$1"
path="$2"

if [ -z "$branch" ]; then
    echo "Usage: $0 <branch> [path]"
    echo ""
    echo "Creates a git worktree with sparse checkout configured."
    echo "If [path] is omitted, the worktree is created at:"
    echo "  ../.fern-worktrees/<branch>"
    exit 1
fi

# Default path: ../.fern-worktrees/<branch>
if [ -z "$path" ]; then
    mkdir -p "$WORKTREE_BASE"
    path="$WORKTREE_BASE/$branch"
fi

# Create worktree — use -b if the branch doesn't exist yet
if git show-ref --verify --quiet "refs/heads/$branch"; then
    git worktree add "$path" "$branch"
else
    git worktree add -b "$branch" "$path"
fi

# Apply sparse checkout in the new worktree
bash "$SCRIPT_DIR/sparse-checkout.sh" "$path"

echo ""
echo "Worktree created at $path with sparse checkout"
