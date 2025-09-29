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

### Seed Testing Workflow (Development)

Seed is the internal testing system used to validate generator changes against test fixtures. Critical for bug fixes and feature development.

**Structure**:
- **Test definitions**: `/test-definitions/` - API spec inputs for testing
- **Seed package**: `/packages/seed/` - CLI tool for running tests  
- **Test snapshots**: `/seed/` - Expected generator outputs (organized as `/seed/<generator>/<fixture>/`)
- **Generator configs**: `/seed/<generator>/seed.yml` - Defines how each generator runs tests

**Setup Commands** (run before any seed testing):
```bash
pnpm install && pnpm compile && pnpm seed:build
```

**Common Seed Commands**:
```bash
# Test against predefined fixtures (overwrites files in /seed/)
pnpm seed test --generator python-sdk --fixture file-download --skip-scripts --log-level debug

# Test against custom fern project  
pnpm seed run --generator go-sdk --path /path/to/fern/project --log-level debug --skip-scripts

# For multi-API projects
pnpm seed run --generator ts-sdk --path /path/to/fern/apis/v1 --log-level debug --skip-scripts
```

**Bug Fix Development Cycle**:
1. **Identify/Create Test**: Find existing fixture or create new one in `/test-definitions/`
2. **Build Environment**: Run `pnpm install && pnpm compile && pnpm seed:build`  
3. **Reproduce Bug**: Run seed test to confirm current behavior
4. **Make Generator Changes**: Modify generator code
5. **Test Fix**: Re-run seed command (always use `--skip-scripts` initially for speed)
6. **Validate Changes**: Use `git diff` to examine generated output differences
7. **Repeat**: Until output matches expected behavior

**Output Locations**:
- **Seed test**: Overwrites files in `/seed/<generator>/<fixture>/` - use `git diff` to see changes
- **Seed run**: Writes to temp directory, seed outputs the path:
  ```
  [go-sdk:custom:]: Wrote files to /private/var/folders/.../tmp-27682-uzCwvbQ3f32l
  ```

**Debug Information**:
- Console logs go to stdout (logging system is inconsistent)
- Generator logs written to temp files:
  ```
  [go-sdk:custom:]: Generator logs here: /private/var/folders/.../tmp-27682-32P2XRqpMioO
  ```
- IR and config files also written to temp directories during execution

**Test Configuration**:
- Each generator's `/seed/<generator>/seed.yml` defines multiple configurations per fixture
- Multiple configs create subfolders: `/seed/<generator>/<fixture>/<output-folder>/`
- Fixtures prefixed with language names (e.g., `java-specific-test`) only run on matching generators
- Unprefixed fixtures run on all generators by default

### Feature Addition Workflow (Generated Code)

Feature additions that require changes to generated code follow a multi-stage workflow across API definitions, IR, and generators.

**Example Use Case**: Adding new parameters to generators.yml schema (like `customSections` in [PR #9371](https://github.com/fern-api/fern/pull/9371))

#### Stage 1: API Schema Changes

1. **Modify API Definition**: Update relevant API definition in `/fern/apis/`
   - Example: `/fern/apis/generators-yml/definition/` for generators.yml changes
   - Other definitions: `docs-yml`, `fern-definition`, `public-api`

2. **Generate TypeScript Schemas**: Run definition-specific update command
   ```bash
   # For generators-yml changes
   pnpm update:generators
   # Commands vary by definition - check generators.yml in each API folder
   ```
   - Updates corresponding schema files (e.g., `/packages/cli/configuration/src/generators-yml/schemas`)
   - Uses generator configuration in each API's `generators.yml`

#### Stage 2: IR Definition Updates

3. **Update IR Definition**: Modify IR types in `/packages/ir-sdk/fern/apis/ir-types-latest/definition/`

4. **Generate IR SDK**: 
   ```bash
   pnpm ir:generate
   ```
   - Updates IR SDK files in `/packages/ir-sdk/src/`

5. **Version Management**: Update version files for publication
   - **Changelog**: `/packages/ir-sdk/fern/apis/ir-types-latest/changelog/CHANGELOG.md`
   - **Version**: `/packages/ir-sdk/fern/apis/ir-types-latest/VERSION` (semantic versioning)
     - Major: Breaking changes
     - Minor: Non-breaking feature additions  
     - Patch: Non-breaking fixes
   - **CLI Version**: `/packages/cli/cli/versions.yml` for new CLI release

6. **Compile and Fix**: Run `pnpm compile` and resolve any breaking changes
   - Common pattern: `switch` statements with `assert never` may need new cases
   - Sometimes temporary "throw error does not support" for unimplemented features

#### Stage 3: IR Publication (Automatic)

7. **IR SDK Publishing**: On PR merge to main, CI/CD automatically publishes new IR SDK versions when VERSION and CHANGELOG files are updated

#### Stage 4: Generator Updates (Multi-PR Process)

8. **Generator Dependency Updates**: Update each generator to use new IR SDK version
   - **Legacy generators** (Java, Python, Go): Written in target language
   - **Modern generators** (C#, newer ones): Written in TypeScript  
   - **Migration approach**: New v2 generators (java-v2, python-v2) alongside legacy
   - **IR version specification**: Each generator has files specifying required IR SDK version

9. **Migration Logic**: Update IR migrations in `/packages/cli/generation/ir-migrations/`
   - Handles backward compatibility when generators expect older IR versions
   - Converts newer IR to format expected by older generators

10. **CLI Version Publishing**: Update CLI version in `versions.yml` triggers new CLI release on merge

**Key Characteristics**:
- **Cross-repo dependency chain**: API Schema → IR Definition → Published IR SDK → Generator Updates → Final CLI Release
- **Generators use published versions**: Not workspace versions, ensuring stable dependencies
- **Multiple PRs required**: Initial IR changes, then separate PRs for each generator family
- **Automatic publishing**: `versions.yml` files throughout codebase trigger releases on merge to main
- **Backward compatibility**: Migration system ensures older generators continue working

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
- **IR Changes**: Require migrations in `packages/generation/ir-migrations/`
- **Testing**: Always run `pnpm test:ete` for end-to-end validation after CLI changes
- **Monorepo**: Use Turbo filters for focused builds/tests on specific packages
- **Docker**: Generators run in Docker containers for isolation and consistency

## Generated Code Management

### Identifying Generated Files
Generated files typically contain headers like:
- `@generated` or `@auto-generated`
- `This file was auto-generated`
- `DO NOT EDIT` warnings

Common patterns:
- `/sdk/src/serialization/` - Serialization code
- `/sdk/src/api/` - API client code  
- Test fixtures in `/seed/` directories

### Regenerating Code
When API definitions change, regenerated code using:
```bash
# For specific generator
pnpm fern generate --group <generator-name>

# For all generators
pnpm fern generate

# Local testing
pnpm fern:local generate --group <generator-name>
```

### After Code Generation
Always run these validation steps:
```bash
pnpm compile                  # Ensure generated code compiles
pnpm lint:eslint:fix         # Fix any linting issues
pnpm test                    # Run unit tests
pnpm test:ete                # Run end-to-end tests
```

## Seed Testing Workflows

### Understanding Seed Structure
- Each `/seed/<language>-<type>/` directory is a test fixture
- `seed.yml` files define test configurations
- Generated outputs are validated against expected results

### Adding New Test Fixtures
1. Create new directory in appropriate `/seed/` subfolder
2. Add `seed.yml` configuration
3. Run `pnpm seed:build` to generate initial outputs
4. Validate outputs manually
5. Commit both configuration and expected outputs

### Updating Existing Fixtures
```bash
# Build specific fixture
pnpm seed:build --filter <fixture-name>

# Rebuild all fixtures (slow)
pnpm seed:build

# Update snapshots if expected
pnpm test:update
```

## Troubleshooting Common Issues

### Generator Container Issues
If generator fails to run:
1. Check Docker is running: `docker ps`
2. Rebuild generator image: `docker build generators/<language>/`
3. Check generator logs in container output

### IR Compilation Failures  
If IR generation fails:
1. Validate API definition syntax: `pnpm fern check`
2. Check for circular references in definitions
3. Verify all imports resolve correctly
4. Review IR migrations if upgrading versions

### Test Failures After Changes
1. **Unit tests fail**: Check if generated code changed
2. **E2E tests fail**: Rebuild CLI with `pnpm fern:build`
3. **Seed tests fail**: Regenerate fixtures with `pnpm seed:build`
4. **Linting fails**: Run `pnpm format:fix` and `pnpm lint:eslint:fix`

### Performance Issues
- Use Turbo filters to build/test only affected packages
- Clear build cache: `pnpm clean` then rebuild
- Check Docker resource limits for generator containers

### Common File Locations for Debugging
- **Build outputs**: `dist/`, `build/`, `.turbo/`
- **Generator configs**: `generators.yml`, custom config files
- **IR output**: Usually in temp directories during generation
- **Docker logs**: Container stdout/stderr during generation
- **Test outputs**: `seed/*/generated/` directories

# Individual Preferences
@~/.claude/my-fern-instructions.md