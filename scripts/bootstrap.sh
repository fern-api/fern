#!/bin/bash
#
# Bootstrap script used to setup Fern's development environment.
#
# Usage: ./bootstrap.sh

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

path_contains_go_bin() {
    echo "$PATH" | grep -q "$HOME/go/bin"
}

get_shell_profile() {
    if [ -n "$ZSH_VERSION" ]; then
        echo "$HOME/.zprofile"
    elif [ -n "$BASH_VERSION" ]; then
        echo "$HOME/.bash_profile"
    else
        echo "Unsupported shell: $SHELL"
        exit 1
    fi
}

echo "Setting up Fern's development environment:"
echo "  user: $(whoami)"
echo "  shell: $SHELL"
echo

echo "Installing dependencies..."

# Install brew.
if ! command_exists brew; then
    echo "Installing brew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi
echo "✅ Homebrew installed"

# Install go.
if ! command_exists go; then
    echo "Installing go..."
    brew install go
fi
echo "✅ go installed"

# Install buf.
if ! command_exists buf; then
    echo "Installing buf..."
    brew install buf
fi
echo "✅ buf installed"

# Install protoc-gen-openapi.
if ! command_exists protoc-gen-openapi; then
    echo "Installing protoc-gen-openapi..."
    go install github.com/fern-api/protoc-gen-openapi/cmd/protoc-gen-openapi@latest
fi
echo "✅ protoc-gen-openapi installed"

# Configure PATH if necessary.
if ! path_contains_go_bin; then
    SHELL_RC=$(get_shell_profile)
    if [ "$SHELL_RC" != "Unsupported shell" ]; then
        echo "Adding ~/go/bin to PATH in $SHELL_RC"
        echo 'export PATH="$HOME/go/bin:$PATH"' >> "$SHELL_RC"
        echo "PATH configured. Please restart your terminal or run: source $SHELL_RC"
    fi
else
  echo "✅ PATH contains ~/go/bin"
fi

echo
echo "🎉 Setup complete!"
