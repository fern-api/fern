# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## PR & Branch Conventions

**Branch Naming**: `devin/{timestamp}-{descriptive-slug}` (generate timestamp with `date +%s`)

**PR Title Format**: Must follow semantic commit format (enforced by `.github/workflows/lint-pr-title.yml`)
- Examples: `feat(python): add discriminated union support`, `fix(seed): handle aliasing in tests`, `docs(claude): improve root guide`
- Valid types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`, `perf`, `ci`, `build`, `revert`

**CI Workflow**: Always wait for all CI checks to complete before reporting completion. Use `git_check_pr` tool to monitor status.

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

## Python Generator Quickstart (End-to-End)

This is a fast-path recipe for making changes to the Python generator. For deeper context, see `generators/python/CLAUDE.md` and `packages/seed/CLAUDE.md`.

**Initial Setup**:
```bash
pnpm install && pnpm compile && pnpm seed:build
```

**Fast Validation Loop** (for a single fixture):
```bash
# Make your changes in generators/python/
pnpm seed:local test --generator python-sdk --fixture exhaustive:no-custom-config --skip-scripts

# Review output changes
git diff seed/python-sdk/exhaustive/no-custom-config/
```

**Expand Testing** (when ready to validate across Pydantic versions):
```bash
pnpm seed:local test --generator python-sdk --fixture exhaustive:pydantic-v1-wrapped --skip-scripts
pnpm seed:local test --generator python-sdk --fixture exhaustive:pydantic-v2-wrapped --skip-scripts
```

**Full Validation** (only after generator changes are stable):
```bash
pnpm test:ete  # Runs all end-to-end tests (slow, ~10+ minutes)
```

**Key Points**:
- Use `--skip-scripts` during development to skip pytest/mypy runs and iterate faster
- Only run full `pnpm test:ete` when you're confident in your changes
- Use `git diff seed/python-sdk/<fixture>/` to review generated code changes before committing

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

### Adding Custom Tests to Seed Fixtures

Custom tests allow you to validate generator behavior beyond basic compilation. Here's how to add pytest tests to Python SDK fixtures that persist across regeneration:

**Location**: `seed/python-sdk/<fixture>/tests/custom/`

**Persistence**: Add test paths to `.fernignore` in the fixture root to prevent regeneration from overwriting them:
```
# seed/python-sdk/<fixture>/.fernignore
tests/custom/
```

**Version-Agnostic Test Template** (works with both Pydantic v1 and v2):
```python
import sys
import pytest

# Detect Pydantic version
if sys.version_info >= (3, 8):
    from importlib.metadata import version as get_version
else:
    from importlib_metadata import version as get_version

PYDANTIC_VERSION = int(get_version("pydantic").split(".")[0])

# Example: Test discriminated union parsing
def test_parse_variant():
    """Test that the correct variant is selected based on discriminator."""
    from seed.types import MyUnion_VariantA
    
    data = {"type": "variant_a", "field": "value"}
    
    if PYDANTIC_VERSION >= 2:
        obj = MyUnion_VariantA.model_validate(data)
    else:
        obj = MyUnion_VariantA.parse_obj(data)
    
    assert isinstance(obj, MyUnion_VariantA)
    assert obj.field == "value"

# Example: Test serialization with aliasing tolerance
def test_serialize_with_aliasing():
    """Test serialization handles both snake_case and camelCase."""
    from seed.types import MyModel
    
    obj = MyModel(my_field="value")
    
    if PYDANTIC_VERSION >= 2:
        data = obj.model_dump()
    else:
        data = obj.dict()
    
    # Tolerant assertion for aliasing (Pydantic v1 may use camelCase)
    field_value = data.get("my_field", data.get("myField"))
    assert field_value == "value"
```

**Best Practices for Custom Tests**:
- **Do**: Write behavioral tests (parsing succeeds, errors surface correctly)
- **Do**: Use version gates for Pydantic v1 vs v2 API differences
- **Do**: Use tolerant assertions for field aliasing (`.get()` with fallback)
- **Don't**: Assert on exact error message formatting (use stable substrings)
- **Don't**: Use typing introspection (`get_origin`, `get_args`) - brittle across Python versions
- **Don't**: Re-parse alias-form JSON unless `populate_by_name` is enabled
- **Don't**: Rely on `by_alias=True` for FieldMetadata aliases (Fern's custom metadata, not Pydantic's Field)

## CI Triage Playbook

When seed tests fail in CI, use this playbook to debug quickly:

### Identifying Failures

**Where to Look**: CI failures appear in seed test matrices (e.g., `python-sdk (exhaustive:no-custom-config, ...)`)

**Quick Grep Patterns** (search bottom-up in logs):
```bash
# Find failing fixtures
grep "unexpected failures, including:" output.log

# Jump to test failures
grep -B 20 "FAILURES" output.log

# Find specific assertion errors
grep -A 5 "AssertionError\|ValidationError" output.log
```

### Known Pitfalls

**Python 3.8 Typing Introspection**:
- `get_origin(Annotated[...])` may return `Union` instead of `Annotated` in Python 3.8 CI environments
- **Solution**: Avoid typing introspection tests; write behavioral tests instead

**Pydantic v1 vs v2 Aliasing**:
- Pydantic v1 with `UniversalBaseModel` may serialize with camelCase (via `FieldMetadata`)
- Pydantic v2 typically uses snake_case by default
- Re-parsing alias-form JSON fails unless `populate_by_name` is enabled
- **Solution**: Write tolerant assertions using `.get()` with fallback, or avoid roundtrip re-parsing

**Resource Issues**:
- Docker or disk-space errors during seed tests
- **Solution**: `docker system prune -af` and rerun just the affected fixture

### Debugging Workflow

1. **Identify failing fixture** from CI summary table
2. **View detailed logs** using `git_ci_job_logs` command with job_id from `git_check_pr`
3. **Reproduce locally**: `pnpm seed:local test --generator python-sdk --fixture <fixture-name>`
4. **Fix and verify**: Make changes, test locally with pytest before pushing
5. **Push and wait**: Always wait for all CI checks to complete before reporting completion

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
