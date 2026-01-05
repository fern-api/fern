# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Environment Setup

This repository uses [DevBox](https://www.jetify.com/devbox) for reproducible development environments with exact version pinning. DevBox is based on Nix and provides cross-platform support (Mac, Linux, Windows via WSL).

**Quick Start with DevBox**:
```bash
# Install DevBox (if not already installed)
curl -fsSL https://get.jetify.com/devbox | bash

# Enter the development environment (installs all dependencies automatically)
devbox shell

# Bootstrap the project
devbox run bootstrap
```

DevBox automatically provides: Node.js 22, pnpm 9.4.0, Go 1.23, Python 3.10, Poetry 1.8, JDK 17, buf 1.50.0, and git-lfs. All versions are pinned in `devbox.json` to match CI.

**Available DevBox Scripts**:
```bash
devbox run bootstrap              # Run pnpm install
devbox run compile                # Compile all packages
devbox run test                   # Run tests
devbox run lint                   # Run linting
devbox run install-protoc-gen-openapi  # Install protoc-gen-openapi tool
```

## Development Commands

**Package Manager**: This project uses `pnpm` (version 9.4.0+) exclusively. Node.js 18+ required.

**Important**: Commands from the root `package.json` can be run directly with `pnpm <command>`. However, when running commands defined in subfolder `package.json` files, always use `pnpm turbo run <command>` so that Turbo can execute dependent tasks first (e.g., compilation before testing).

**Common Commands** (from root):
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

**Running Individual Package Commands**: For commands in subfolder packages, use `pnpm turbo run <command> --filter @fern-api/cli` (e.g., `pnpm turbo run test --filter @fern-api/cli`)

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

### TypeScript Rules

#### Typing

**Never use `any`.** If the type is truly unknown, use `unknown` and narrow it with type guards. If you're tempted to use `any`, stop and find the correct type or create one.

**Never use `as X` for type assertions unless you have information the compiler cannot infer.** Valid uses are rare—typically only when working with DOM APIs, test mocks, or deserializing JSON where you've validated the shape. If you need to assert, prefer `satisfies` for validation without widening.

**Never use `as any` or `as unknown as X`.** These are escape hatches that bypass the type system entirely. If the types don't line up, fix the types.

**Never use non-null assertions (`!`) unless you can prove the value is defined and the compiler simply cannot see it.** Prefer optional chaining (`?.`), nullish coalescing (`??`), or explicit null checks.

**Never use `@ts-ignore`.** If you must suppress an error, use `@ts-expect-error` with a comment explaining why, and only as a last resort.

**Never use loose types like `object`, `{}`, or `Function`.** Use specific object shapes, `Record<K, V>`, or typed function signatures like `() => void`.

**Always provide explicit return types for exported functions and public methods.** This serves as documentation and catches accidental return type changes.

**Prefer type guards and discriminated unions over type assertions for narrowing.** Write `if ('kind' in x)` or custom type guards rather than asserting.

**Prefer `unknown` over `any` in generic constraints when the type truly varies.** Use `<T>` or `<T extends SomeBase>` rather than accepting `any`.

**When working with external data (API responses, JSON parsing), validate and narrow with type guards—never assert the shape blindly.**

Here are additional TypeScript rules beyond type safety:

#### Async/Await & Promises

**Never use `.then()` chains when `async/await` is available.** Prefer linear async code over nested callbacks or promise chains.

**Never forget to `await` a Promise.** Unhandled promises silently fail. If you intentionally don't await, assign to `void` and add a comment explaining why.

**Never use `async` on a function that doesn't `await` anything.** It adds unnecessary overhead and obscures intent.

#### Error Handling

**Never swallow errors with empty catch blocks.** At minimum, log the error. If you truly want to ignore it, add a comment explaining why.

**Never throw strings or plain objects.** Always throw `Error` instances (or subclasses) to preserve stack traces.

**Prefer early returns over deeply nested conditionals.** Guard clauses make code easier to follow.

#### Immutability & Mutation

**Never mutate function parameters.** Create new objects/arrays instead. Use spread, `map`, `filter`, not `push`, `splice`, or direct assignment.

**Prefer `const` over `let`.** Only use `let` when reassignment is actually necessary.

**Never use `var`.**

#### Imports & Modules

**Never use default exports.** Named exports are easier to refactor, auto-import, and grep for.

**Never use `require()` in TypeScript.** Use ES module `import` syntax.

**Keep imports organized.** External dependencies first, then internal modules, then relative imports.

#### Naming & Structure

**Never use abbreviations in variable names unless universally understood** (e.g., `id`, `url`). Write `response`, not `res`. Write `error`, not `err`.

**Never use `I` prefix for interfaces.** Just name the thing what it is.

**Prefer pure functions where possible.** Functions that depend only on their inputs are easier to test and reason about.

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

1. **PR Title**: Must follow semantic commit message rules with format `<type>(<scope>): <description>`. The type and scope must match those defined in `.github/workflows/lint-pr-title.yml`. For example: `chore(docs): update guidelines` or `feat(python): add new feature`.
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
