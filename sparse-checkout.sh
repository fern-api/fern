#!/bin/bash
#
#
#

set -e

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

if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    print_error "This script must be run from the root of the fern repository"
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
