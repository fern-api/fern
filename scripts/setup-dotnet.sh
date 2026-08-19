#!/bin/bash
# Setup .NET SDK versions required for C# generator development
# Official Microsoft installation: https://learn.microsoft.com/en-us/dotnet/core/install/

set -euo pipefail

REQUIRED_VERSIONS=("9.0" "10.0")
DOTNET_INSTALL_URL="https://dot.net/v1/dotnet-install.sh"
DOTNET_INSTALL_SCRIPT="/tmp/dotnet-install.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_version() {
    local version=$1
    if command -v dotnet &> /dev/null; then
        # Check if this specific version is available
        if dotnet --list-sdks 2>/dev/null | grep -q "^$version\."; then
            echo -e "${GREEN}✓${NC} .NET $version is installed"
            return 0
        fi
    fi
    echo -e "${YELLOW}✗${NC} .NET $version is not installed"
    return 1
}

install_dotnet_version() {
    local version=$1
    echo -e "${YELLOW}Installing .NET $version...${NC}"

    # Download official Microsoft dotnet-install script if not cached
    if [ ! -f "$DOTNET_INSTALL_SCRIPT" ]; then
        echo "Downloading official Microsoft dotnet-install script..."
        curl -sSL "$DOTNET_INSTALL_URL" -o "$DOTNET_INSTALL_SCRIPT"
        chmod +x "$DOTNET_INSTALL_SCRIPT"
    fi

    # Run installation script
    if "$DOTNET_INSTALL_SCRIPT" --channel "$version" --install-dir "$HOME/.dotnet"; then
        echo -e "${GREEN}✓${NC} .NET $version installed successfully"
        return 0
    else
        echo -e "${RED}✗${NC} Failed to install .NET $version"
        return 1
    fi
}

main() {
    echo "Checking .NET SDK versions..."
    echo ""

    local all_installed=true
    for version in "${REQUIRED_VERSIONS[@]}"; do
        if ! check_version "$version"; then
            all_installed=false
        fi
    done

    echo ""

    if [ "$all_installed" = true ]; then
        echo -e "${GREEN}All required .NET versions are installed!${NC}"
        return 0
    fi

    echo -e "${YELLOW}Missing .NET versions detected. Installing automatically...${NC}"
    echo ""

    for version in "${REQUIRED_VERSIONS[@]}"; do
        if ! check_version "$version"; then
            install_dotnet_version "$version" || true
        fi
    done

    # Ensure tools path is available for installing global tools
    export PATH="$HOME/.dotnet:$HOME/.dotnet/tools:$PATH"

    # Install CSharpier if not already installed
    if ! command -v csharpier &> /dev/null; then
        echo -e "${YELLOW}Installing CSharpier...${NC}"
        if dotnet tool install -g csharpier; then
            echo -e "${GREEN}✓${NC} CSharpier installed successfully"
        else
            echo -e "${RED}✗${NC} Failed to install CSharpier"
        fi
    else
        echo -e "${GREEN}✓${NC} CSharpier is already installed"
    fi

    echo ""
    echo -e "${YELLOW}Make sure \$HOME/.dotnet and \$HOME/.dotnet/tools are in your PATH.${NC}"
    echo "Add to your shell profile (~/.zshrc, ~/.bashrc, etc):"
    echo "  export PATH=\"\$HOME/.dotnet:\$HOME/.dotnet/tools:\$PATH\""
    echo ""
    echo "Alternatively, follow the official Microsoft installation guide:"
    echo "  https://learn.microsoft.com/en-us/dotnet/core/install/"
}

main "$@"
