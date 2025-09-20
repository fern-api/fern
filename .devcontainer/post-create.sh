#!/bin/bash
set -e

echo "🚀 Setting up Fern development environment..."

# Update package lists
sudo apt-get update

# Install additional system dependencies
sudo apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    unzip \
    jq \
    protobuf-compiler \
    libprotobuf-dev

# Install buf (Protocol Buffer tool)
if ! command -v buf &> /dev/null; then
    echo "Installing buf..."
    BUF_VERSION="1.32.2"
    curl -sSL "https://github.com/bufbuild/buf/releases/download/v${BUF_VERSION}/buf-Linux-$(uname -m)" -o "/tmp/buf"
    sudo mv /tmp/buf /usr/local/bin/buf
    sudo chmod +x /usr/local/bin/buf
fi

# Install protoc-gen-openapi
if ! command -v protoc-gen-openapi &> /dev/null; then
    echo "Installing protoc-gen-openapi..."
    go install github.com/fern-api/protoc-gen-openapi/cmd/protoc-gen-openapi@latest
fi

# Install NVM and Node.js
if ! command -v nvm &> /dev/null; then
    echo "Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
fi

# Install Node.js 20 (as specified in package.json)
if ! command -v node &> /dev/null || ! node --version | grep -q "v20"; then
    echo "Installing Node.js 20..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
    nvm alias default 20
fi

# Install npm (should come with Node.js, but ensure it's available)
if ! command -v npm &> /dev/null; then
    echo "Installing npm..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    npm install -g npm@latest
fi

# Install pnpm globally
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm@9.4.0
fi

# Install Poetry for Python
if ! command -v poetry &> /dev/null; then
    echo "Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="$HOME/.local/bin:$PATH"
fi

# Install Swift toolchain
if ! command -v swift &> /dev/null; then
    echo "Installing Swift toolchain..."
    SWIFT_VERSION="6.1.2"
    curl -O https://download.swift.org/swiftly/linux/swiftly-$(uname -m).tar.gz
    tar zxf swiftly-$(uname -m).tar.gz
    ./swiftly init --quiet-shell-followup
    source "${SWIFTLY_HOME_DIR:-$HOME/.local/share/swiftly}/env.sh"
    swiftly install --use "$SWIFT_VERSION"
    rm -f swiftly-$(uname -m).tar.gz swiftly
fi

# Install Ruby and bundler
if ! command -v ruby &> /dev/null; then
    echo "Installing Ruby..."
    sudo apt-get install -y ruby-full ruby-dev
fi

if ! command -v gem &> /dev/null || ! gem list | grep -q bundler; then
    echo "Installing bundler..."
    gem install bundler
fi

# Install PHP and Composer
if ! command -v php &> /dev/null; then
    echo "Installing PHP..."
    sudo apt-get install -y php php-cli php-curl php-json php-mbstring php-xml php-zip
fi

if ! command -v composer &> /dev/null; then
    echo "Installing Composer..."
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
fi

# Install .NET SDK for C#
if ! command -v dotnet &> /dev/null; then
    echo "Installing .NET SDK..."
    wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
    sudo dpkg -i packages-microsoft-prod.deb
    rm packages-microsoft-prod.deb
    sudo apt-get update
    sudo apt-get install -y dotnet-sdk-8.0
fi

# Install Gradle for Java (using SDKMAN)
if ! command -v gradle &> /dev/null; then
    echo "Installing Gradle via SDKMAN..."
    curl -s "https://get.sdkman.io" | bash
    source "$HOME/.sdkman/bin/sdkman-init.sh"
    sdk install gradle 8.7
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install project dependencies
echo "Installing project dependencies..."
cd /workspaces/fern
pnpm install

# Install fern-api CLI globally
echo "Installing fern-api CLI..."
npm install -g @fern-api/cli

# Install global tools that are used by the project
echo "Installing global development tools..."
npm install -g @biomejs/biome@2.1.1
npm install -g cspell@^8.17.2
npm install -g stylelint@^14.11.0
npm install -g prettier@^3.4.2
npm install -g turbo@^2.5.5
npm install -g nx@^21.3.8
npm install -g tsx@^4.20.3
npm install -g vitest@^2.1.9

# Set up Git configuration (if not already set)
if [ -z "$(git config --global user.name)" ]; then
    echo "Setting up Git configuration..."
    git config --global user.name "Codespace User"
    git config --global user.email "codespace@github.com"
fi

# Add NVM to shell profiles
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
    echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.zshrc
fi

# Add Go bin to PATH if not already there
if ! echo "$PATH" | grep -q "$HOME/go/bin"; then
    echo 'export PATH="$HOME/go/bin:$PATH"' >> ~/.bashrc
    echo 'export PATH="$HOME/go/bin:$PATH"' >> ~/.zshrc
fi

# Add Poetry to PATH if not already there
if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
fi

# Add Swift to PATH if not already there
if ! echo "$PATH" | grep -q "$HOME/.local/share/swiftly"; then
    echo 'export PATH="$HOME/.local/share/swiftly/current/usr/bin:$PATH"' >> ~/.bashrc
    echo 'export PATH="$HOME/.local/share/swiftly/current/usr/bin:$PATH"' >> ~/.zshrc
fi

# Source SDKMAN if installed
if [ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]; then
    echo 'source "$HOME/.sdkman/bin/sdkman-init.sh"' >> ~/.bashrc
    echo 'source "$HOME/.sdkman/bin/sdkman-init.sh"' >> ~/.zshrc
fi

echo "✅ Fern development environment setup complete!"
echo ""
echo "Installed tools:"
echo "  - NVM $(nvm --version 2>/dev/null || echo 'installed')"
echo "  - Node.js $(node --version)"
echo "  - npm $(npm --version)"
echo "  - pnpm $(pnpm --version)"
echo "  - fern-api CLI $(fern --version 2>/dev/null || echo 'installed')"
echo "  - Go $(go version)"
echo "  - Java $(java -version 2>&1 | head -n 1)"
echo "  - Python $(python3 --version)"
echo "  - Rust $(rustc --version)"
echo "  - Docker $(docker --version)"
echo "  - buf $(buf --version)"
echo "  - protoc-gen-openapi $(protoc-gen-openapi --version 2>/dev/null || echo 'installed')"
echo "  - Swift $(swift --version 2>/dev/null | head -n 1 || echo 'installed')"
echo "  - Ruby $(ruby --version)"
echo "  - PHP $(php --version | head -n 1)"
echo "  - .NET $(dotnet --version)"
echo "  - Gradle $(gradle --version 2>/dev/null | head -n 1 || echo 'installed')"
echo "  - Biome $(biome --version 2>/dev/null || echo 'installed')"
echo "  - Stylelint $(stylelint --version 2>/dev/null || echo 'installed')"
echo "  - Prettier $(prettier --version 2>/dev/null || echo 'installed')"
echo "  - Turbo $(turbo --version 2>/dev/null || echo 'installed')"
echo "  - Nx $(nx --version 2>/dev/null || echo 'installed')"
echo "  - Vitest $(vitest --version 2>/dev/null || echo 'installed')"
echo ""
echo "🎉 Ready to develop with Fern!"
echo ""
echo "Common commands:"
echo "  fern --help      - Show Fern CLI help"
echo "  pnpm compile     - Compile all generators"
echo "  pnpm test        - Run tests"
echo "  pnpm lint:biome  - Run Biome linting"
echo "  pnpm format      - Format code with Biome"
echo "  pnpm check       - Run Biome checks"
