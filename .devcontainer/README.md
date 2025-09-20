# Fern Development Container

This devcontainer configuration provides a complete development environment for the Fern project, supporting all the programming languages and tools used across the various generators.

## What's Included

### Core Languages & Runtimes
- **Node.js 20** - Primary runtime for TypeScript generators and tooling
- **Go 1.23** - For Go generators and protoc-gen-openapi
- **Java 17** - For Java generators with Gradle support
- **Python 3.11** - For Python generators with Poetry
- **Rust** - For Rust generators
- **Ruby** - For Ruby generators
- **PHP** - For PHP generators
- **Swift 6.1.2** - For Swift generators
- **.NET 8.0** - For C# generators

### Build Tools & Package Managers
- **pnpm 9.4.0** - Primary package manager for the monorepo
- **Poetry** - Python dependency management
- **Bundler** - Ruby dependency management
- **Composer** - PHP dependency management
- **Gradle 8.7** - Java build tool (via SDKMAN)
- **Cargo** - Rust package manager
- **Turbo** - Build system for the monorepo
- **Nx** - Build system and workspace management

### Protocol Buffer Tools
- **buf** - Modern Protocol Buffer tooling
- **protoc-gen-openapi** - Custom protobuf plugin for OpenAPI generation
- **protobuf-compiler** - Standard Protocol Buffer compiler

### Code Quality & Development Tools
- **Biome 2.1.1** - Fast formatter and linter (primary tool)
- **Prettier** - Code formatter (fallback)
- **Stylelint** - CSS/SCSS linter
- **CSpell** - Spell checker
- **Vitest** - Testing framework
- **tsx** - TypeScript execution

### Container & Development Tools
- **Docker** - For running containerized generators
- **Docker Compose** - For multi-container setups
- **Git** - Version control
- **VS Code Extensions** - Pre-configured for all supported languages

## Getting Started

1. Open this repository in GitHub Codespaces
2. The devcontainer will automatically build and install all dependencies
3. Once ready, you can run:
   ```bash
   pnpm install          # Install all project dependencies
   pnpm compile          # Compile all generators
   pnpm test            # Run tests
   ```

## Generator-Specific Setup

Each generator directory contains its own configuration files:
- **Go**: `go.mod`, `go.sum`
- **Java**: `build.gradle`, `gradle/`
- **Python**: `pyproject.toml`, `poetry.lock`
- **Rust**: `Cargo.toml` files in subdirectories
- **Ruby**: `Gemfile` in playground
- **C#**: `.sln` and `.csproj` files
- **Swift**: Custom installation script

## Docker Support

The container includes Docker-in-Docker support, allowing you to:
- Build and run generator Docker images
- Test containerized generators locally
- Use Docker Compose for complex setups

## Troubleshooting

If you encounter issues:

1. **Missing tools**: The post-create script installs everything automatically, but you can re-run it:
   ```bash
   bash .devcontainer/post-create.sh
   ```

2. **PATH issues**: The script adds necessary paths to your shell profile. Restart your terminal or run:
   ```bash
   source ~/.bashrc
   ```

3. **Generator-specific issues**: Check the individual generator directories for specific setup instructions.

## VS Code Extensions

The following extensions are automatically installed:
- Language support for all included languages
- **Biome** - Primary formatter and linter (configured as default)
- **Stylelint** - CSS/SCSS linting
- **Vitest Explorer** - Test runner integration
- GitHub Copilot for AI assistance
- Docker support
- YAML and JSON support
- Markdown support

## Notes

- This configuration is optimized for Linux (Ubuntu 22.04) as used in GitHub Codespaces
- The original `bootstrap.sh` script is macOS-specific and not used in this container
- All tools are installed system-wide for consistency across the development environment
