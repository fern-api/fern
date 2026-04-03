#!/bin/bash
#
# Configures sparse checkout to exclude large test fixture directories.
# Can be run from the repo root or from a worktree.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo "→ $1"
}

# Allow running from a worktree path passed as $1, or default to repo root
TARGET_DIR="${1:-$REPO_ROOT}"
cd "$TARGET_DIR"

if [ ! -f "package.json" ]; then
    print_error "Target directory does not appear to be a fern checkout: $TARGET_DIR"
    exit 1
fi

print_info "Initializing sparse checkout..."
git sparse-checkout init --no-cone 2>/dev/null || true
print_success "Sparse checkout initialized"

print_info "Configuring sparse checkout patterns..."
git sparse-checkout set --no-cone \
    '/*' \
    '!seed' \
    '!seed-remote-local' \
    'packages/seed/**' \
    'seed/**/seed.yml' \
    'seed-remote-local/**/seed.yml' \
    '!**/__snapshots__/**'

print_success "Sparse checkout configured"

echo ""
echo "Sparse checkout configuration:"
echo "  ✓ All root files and directories included"
echo "  ✓ Excluded: seed/ directory (except seed.yml files)"
echo "  ✓ Excluded: seed-remote-local/ directory (except seed.yml files)"
echo "  ✓ Excluded: All __snapshots__/ directories"
echo "  ✓ Included: packages/seed/** (seed CLI source code)"
echo ""
