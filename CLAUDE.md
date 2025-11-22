# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: This project uses `pnpm` (version 9.4.0+) exclusively. Node.js 18+ required.

**Common Commands**:
```bash
# Initial setup
pnpm bootstrap                    # Bootstrap the development environment

# Building
pnpm compile                      # Compile all packages (production build)
pnpm compile:debug               # Compile with debug info
pnpm clean                       # Clean all build outputs

# Testing
pnpm test                        # Run all tests (excludes end-to-end tests)
pnpm test:debug                  # Run tests with debug info
pnpm test:update                 # Update test snapshots
pnpm test:ete                    # Run end-to-end tests (slower, requires CLI build)

# Linting & Formatting
pnpm lint:eslint                 # Run ESLint
pnpm lint:eslint:fix            # Fix ESLint issues
pnpm format                     # Check formatting with Biome
pnpm format:fix                 # Fix formatting issues

# Fern CLI (for testing)
pnpm fern:build                 # Build production CLI
pnpm fern:local                 # Run local development CLI
pnpm fern                       # Run local CLI directly

# Seed (generator testing)
pnpm seed:build                 # Build seed CLI for generator testing
```

**Running Individual Tests**: Use Turbo filters, e.g., `pnpm test --filter @fern-api/cli`

**Dependency Management**: Run `pnpm depcheck` to check for unused dependencies

## Architecture Overview

Fern is a CLI tool for API-first development that transforms API definitions into SDKs and documentation. The architecture has three main layers:

### 1. CLI Layer (`/packages/cli/`)
- **Entry Point**: `packages/cli/cli/src/cli.ts` - Main yargs-based CLI
- **Key Components**:
  - Configuration management (`fern.config.json`, `generators.yml`)
  - Project/workspace loading and validation
  - Command orchestration (`generate`, `check`, `init`, `mock`, etc.)
  - Logging and error handling infrastructure

### 2. Core Processing (`/packages/`)
- **Workspace Management**: Loads and validates API workspaces from multiple formats
- **IR (Intermediate Representation)**: Central data structure (`/ir-sdk/`) consumed by all generators
- **Import/Export**: Converts external formats (OpenAPI, AsyncAPI, gRPC) to Fern IR
- **Utilities**: Core libraries for file system, logging, path handling, etc.

### 3. Generator Layer (`/generators/`)
Language-specific generators that consume IR and produce outputs:
- **Pattern**: Each language has `base/`, `ast/`, `model/`, `sdk/`, sometimes `server/`
- **Supported**: TypeScript, Python, Java, Go, C#, Ruby, PHP, Rust, Swift
- **Special**: OpenAPI export, Postman collections, TypeScript MCP servers

### 4. Testing (`/seed/`)
Comprehensive generator testing with Docker-based fixtures across all supported languages.

## Key Architectural Patterns

1. **IR-Centric**: All API definitions convert to canonical IR format for consistent generator behavior
2. **Plugin Architecture**: Generators are Docker-containerized plugins implementing `AbstractGeneratorCli`
3. **Workspace-Based**: Projects support multiple API workspaces with different configurations
4. **Turbo Monorepo**: Uses pnpm workspaces + Turbo for builds and caching

## Core Workflows

### Production SDK Generation Flow

When users run `fern generate --group <group-name>` in production:

1. **CLI Version Check**: Fern CLI checks `fern.config.json` for required version and auto-downloads/installs if needed
2. **Configuration Discovery**: CLI locates `generators.yml` file(s) in the fern directory structure:
   - Single API: `fern/generators.yml` 
   - Multiple APIs: `fern/apis/<api-name>/generators.yml` (separate configs per API)
3. **Generator Selection**: Uses `--group` parameter or `default-group` field to determine which generator group to run
4. **IR Generation**: Creates Fern IR file containing all information needed for generation (always latest IR version)
5. **Version Compatibility**: Checks generator version (e.g., `typescript-node-sdk:2.6.3`) against required IR version (e.g., `irVersion: 58`) using `/generators/<lang>/sdk/versions.yml`
6. **IR Migration**: If needed, migrates IR backward to match generator's expected version using `/packages/cli/generation/ir-migrations`
7. **Generation Execution**:
   - **Local**: `--local` flag downloads Docker image and runs generation locally
   - **Remote**: Uses Fiddle service for server-side generation (being deprecated)
8. **Output Delivery**: Based on `generators.yml` output configuration:
   - **Package registries**: npm, PyPI, Maven, NuGet, RubyGems
   - **GitHub**: release/pull-request/push modes  
   - **Local filesystem**: saves to specified directory

### Seed Testing (Development)

Seed validates generator changes against test fixtures. Essential for bug fixes and feature development.

**Structure**: `/test-definitions/` (inputs) → `/packages/seed/` (CLI) → `/seed/<generator>/<fixture>/` (outputs)

**Setup**: `pnpm install && pnpm compile && pnpm seed:build`

**Commands**:
```bash
# Test predefined fixture
pnpm seed test --generator python-sdk --fixture file-download --skip-scripts

# Test custom project
pnpm seed run --generator go-sdk --path /path/to/project --skip-scripts
```

**Development Cycle**:
1. Run seed test to reproduce issue
2. Modify generator code
3. Re-run seed test (use `git diff` to see output changes)
4. Repeat until fixed

**Output**: Seed test overwrites `/seed/<generator>/<fixture>/`, seed run writes to temp directory

### Feature Addition Workflow (Generated Code)

Multi-stage process: API Schema → IR Updates → Generator Updates → Release

**Stages**:
1. **API Schema**: Update `/fern/apis/<definition>/` → Run generator command (check `generators.yml` in each API folder)
2. **IR Updates**: Modify `/packages/ir-sdk/fern/apis/ir-types-latest/definition/` → `pnpm ir:generate`
3. **Versioning**: Update `CHANGELOG.md`, `VERSION`, and `/packages/cli/cli/versions.yml`
4. **Compile**: `pnpm compile` and fix breaking changes (common: `switch` statements need new cases)
5. **Generator Updates**: One PR for CLI/IR updates (merge first), then separate PR(s) for generator changes
6. **IR Migrations**: Update `/packages/cli/generation/ir-migrations/` for backward compatibility

**Key Points**: Multiple PRs required, automatic publishing via `versions.yml`, generators use published (not workspace) IR versions

### Other Core Workflows

1. **Documentation**: Markdown processing + API references → Static site
2. **Validation**: Schema validation + reference checking + example verification

## Important Files & Locations

- **CLI Entry**: `packages/cli/cli/src/cli.ts`
- **IR Schema**: `packages/ir-sdk/` (central data structure)
- **Generator Base**: `generators/base/` (shared generator infrastructure)
- **Workspace Loading**: `packages/cli/workspace/loader/`
- **Configuration**: `packages/cli/configuration/`
- **Build Config**: `turbo.json`, `pnpm-workspace.yaml`

## Development Notes

- **Generator Development**: Implement `AbstractGeneratorCli`, use IR as input, follow existing language patterns
- **Generator-Specific Documentation**: Each major generator has its own CLAUDE.md file:
  - `generators/python/CLAUDE.md` - Python v1+v2 tandem system
  - `generators/java/CLAUDE.md` - Java v1+v2 tandem system
  - `generators/go/CLAUDE.md` - Go v1+v2 tandem system
  - `generators/typescript/CLAUDE.md` - Legacy TypeScript generator
  - `generators/ruby-v2/CLAUDE.md` - Modern Ruby generator (standalone)
  - `generators/csharp/CLAUDE.md` - Modern C# generator
- **IR Changes**: Require migrations in `packages/generation/ir-migrations/`
- **Testing**: Always run `pnpm test:ete` for end-to-end validation after CLI changes
- **Monorepo**: Use Turbo filters for focused builds/tests on specific packages
- **Docker**: Generators run in Docker containers for isolation and consistency

## Generated Code Management

**Identifying**: Generated by Fern (not third-party tools). Common locations: `/sdk/src/serialization/`, `/sdk/src/api/`, `/seed/` test fixtures.

**Regenerating**: `pnpm fern generate [--group <name>]` or `pnpm fern:local generate` for local testing

**Validation**: Run `pnpm compile` to check for issues. Test individual fixtures during development. Run full validation (`pnpm check:fix`, `pnpm test`, `pnpm test:ete`) only when changes are complete.

## Seed Testing & Fixtures

### Adding/Updating Fixtures

**New fixtures**: Create `/seed/<generator>/<fixture>/` directory → Add `seed.yml` config → Run `pnpm seed:build` → Run `pnpm test:update` and `pnpm test:ete:update` → Validate → Commit

**Update fixtures**: `pnpm seed:build --filter <fixture-name>` or `pnpm test:update` for snapshots

## Pull Request Guidelines

When creating pull requests in this repository:

1. **PR Title**: Must follow semantic commit message rules (see `.github/workflows/lint-pr-title.yml`)
2. **Assignee**: Always assign the person who prompted you to create the PR as the assignee
3. **Description**: Follow the PR template in `.github/pull_request_template.md`
4. **Testing**: Ensure all tests pass before marking PR as ready for review

## Troubleshooting

### Quick Fixes by Issue Type
- **Generator failures**: Check `docker ps` → Rebuild image → Check container logs
- **IR compilation**: `pnpm fern check` → Check circular refs → Review migrations
- **Test failures**: Unit (check generated code) | E2E (`pnpm fern:build`) | Seed (`pnpm seed:build`) | Lint (`pnpm format:fix`)
- **Performance**: Use Turbo filters | `pnpm clean` then rebuild | Check Docker limits

### Debug Locations
- **Build outputs**: `dist/`, `.turbo/` directories
- **Test outputs**: `/seed/<generator>/<fixture>/` directories

# Individual Preferences
@~/.claude/my-fern-instructions.md
