#!/bin/bash
#
#
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
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

echo "=========================================="
echo "Fern Repository Setup"
echo "=========================================="
echo ""

print_info "Checking for watchman..."
if command_exists watchman; then
    print_success "watchman is already installed"
else
    print_warning "watchman is not installed. Attempting to install..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command_exists brew; then
            print_info "Installing watchman via Homebrew..."
            if brew install watchman 2>/dev/null; then
                print_success "watchman installed successfully"
            else
                print_warning "Failed to install watchman via Homebrew (non-fatal)"
            fi
        else
            print_warning "Homebrew not found. Skipping watchman installation (non-fatal)"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt-get; then
            print_info "Installing watchman via apt-get..."
            if sudo apt-get update && sudo apt-get install -y watchman 2>/dev/null; then
                print_success "watchman installed successfully"
            else
                print_warning "Failed to install watchman via apt-get (non-fatal)"
            fi
        elif command_exists yum; then
            print_info "Installing watchman via yum..."
            if sudo yum install -y watchman 2>/dev/null; then
                print_success "watchman installed successfully"
            else
                print_warning "Failed to install watchman via yum (non-fatal)"
            fi
        elif command_exists dnf; then
            print_info "Installing watchman via dnf..."
            if sudo dnf install -y watchman 2>/dev/null; then
                print_success "watchman installed successfully"
            else
                print_warning "Failed to install watchman via dnf (non-fatal)"
            fi
        else
            print_warning "No supported package manager found for watchman installation (non-fatal)"
        fi
    else
        print_warning "Unsupported platform for automatic watchman installation (non-fatal)"
    fi
fi

echo ""

print_info "Configuring git settings for large repositories..."

git config core.fsmonitor true
print_success "Enabled git fsmonitor"

git config core.untrackedcache true
print_success "Enabled git untracked cache"

git config feature.manyFiles true
print_success "Enabled git manyFiles feature"

echo ""

print_info "Configuring sparse checkout..."
./scripts/configure-sparse-checkout.sh

echo ""

print_info "Configuring turbo remote caching..."
if command_exists npx; then
    print_info "Logging into turbo..."
    if npx turbo login 2>/dev/null; then
        print_success "Logged into turbo"
        
        print_info "Linking turbo..."
        if npx turbo link 2>/dev/null; then
            print_success "Linked turbo remote caching"
        else
            print_warning "Failed to link turbo (non-fatal)"
        fi
    else
        print_warning "Failed to login to turbo (non-fatal)"
    fi
else
    print_warning "npx not found. Skipping turbo configuration (non-fatal)"
fi

echo ""

print_info "Running bootstrap script..."
if [ -f "scripts/bootstrap.sh" ]; then
    ./scripts/bootstrap.sh
else
    print_warning "bootstrap.sh not found, skipping..."
fi

echo ""

print_info "Installing dependencies with pnpm..."
if command_exists pnpm; then
    pnpm install
    print_success "Dependencies installed"
else
    print_error "pnpm is not installed. Please install pnpm first:"
    print_error "  npm install -g pnpm"
    exit 1
fi

echo ""

print_info "Compiling packages..."
pnpm compile
print_success "Compilation complete"

echo ""

print_info "Building seed..."
pnpm seed:build
print_success "Seed build complete"

echo ""
echo "=========================================="
echo "🎉 Setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Consider cloning the sdk-starter repo to test SDK generation:"
echo "     git clone https://github.com/fern-api/sdk-starter.git"
echo ""
echo "  2. Try generating an SDK with seed:"
echo "     pnpm seed run --generator ts-sdk --path /path/to/sdk-starter"
echo ""
echo "  3. If you need to reset your sparse checkout configuration, run:"
echo "     ./scripts/configure-sparse-checkout.sh"
echo ""
