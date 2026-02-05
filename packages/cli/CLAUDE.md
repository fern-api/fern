# CLI Package - Core Architecture

This file provides guidance for Claude Code when working with the Fern CLI package and its sub-packages.

## Overview

The CLI package is Fern's **command-line interface and orchestration layer** that coordinates API workspace loading, IR generation, generator execution, and output delivery. It's structured as 28 sub-packages with specific responsibilities.

## Architecture

- **Multi-Package Structure**: 28 specialized packages for different CLI responsibilities
- **yargs-based CLI**: Main command interface with subcommands and options
- **Workspace Management**: Loads and validates Fern API workspaces
- **Generation Pipeline**: API → IR → Generators → Output
- **Version Management**: CLI auto-update and generator version coordination

## Key Sub-Packages

### Core CLI (`packages/cli/cli/`)
- `src/cli.ts` - Main yargs-based CLI (58K+ lines)
- `src/commands/` - Command implementations (generate, check, init, etc.)
- `src/cli-context/` - CLI execution context and state management
- Entry point for all Fern CLI operations

### Workspace & Configuration
- `workspace/` - API workspace loading and validation
- `configuration/` - `fern.config.json` and `generators.yml` processing
- `configuration-loader/` - Configuration file discovery and parsing
- `project-loader/` - Multi-workspace project management

### Generation System
- `generation/` - Core generation logic and IR migrations
- `api-importers/` - OpenAPI, AsyncAPI, gRPC → Fern conversion
- `fern-definition/` - Fern API definition processing

### Documentation
- `docs-resolver/` - Markdown and API reference processing
- `docs-preview/` - Local documentation server
- `docs-markdown-utils/` - Markdown processing utilities
- `docs-importers/` - External documentation import

### Developer Tools
- `init/` - New project initialization (`fern init`)
- `mock/` - API mocking server
- `register/` - Generator registration and discovery
- `login/` - Authentication and token management

### Infrastructure
- `cli-logger/` - Structured logging system
- `cli-migrations/` - CLI version migrations
- `semver-utils/` - Semantic version management
- `task-context/` - Long-running task coordination

## Core Commands

### Generation Commands
```bash
fern generate                    # Generate SDKs/docs from API definition
fern generate --group <name>    # Generate specific group
fern generate --local          # Run generators locally in Docker
fern generate-ir              # Generate IR without running generators
```

### Validation Commands
```bash
fern check                     # Validate API definitions
fern format                    # Format Fern files
fern diff                      # Compare API versions
```

### Project Management
```bash
fern init                      # Initialize new Fern project
fern add-generator <name>      # Add generator to project
fern login                     # Authenticate with Fern
```

### Development Commands
```bash
fern docs dev                  # Start local docs server
fern mock                      # Start API mock server
fern register                  # Register custom generator
```

## Common Issues & Debugging

### Workspace Loading Issues
- **Configuration Errors**: Invalid `fern.config.json` or `generators.yml`
- **File Discovery**: CLI can't find Fern files in expected locations
- **Multi-Workspace**: Complex project structures with multiple APIs
- **Version Conflicts**: CLI version doesn't match required version

### Generation Pipeline Issues
- **IR Generation Failures**: API definition → IR conversion fails
- **Generator Version Mismatch**: Generator requires different IR version
- **Migration Failures**: IR migration to older version fails
- **Docker Issues**: Local generator execution problems

### Authentication & Network
- **Token Expiry**: Authentication tokens need refresh
- **Network Connectivity**: Can't reach Fern cloud services
- **Proxy Issues**: Corporate network restrictions
- **Rate Limiting**: API rate limits exceeded

## Development Commands

### CLI Development
```bash
cd packages/cli/cli
pnpm compile                   # Compile TypeScript
pnpm test                      # Run CLI tests
pnpm build                     # Build production CLI
pnpm -w lint:biome             # Lint (from workspace root)
pnpm -w check                  # Check (from workspace root)
pnpm -w format                 # Format (from workspace root)
```

### Multi-Package Development
```bash
# From repository root
pnpm compile                   # Compile all CLI packages
pnpm test --filter "*cli*"     # Test all CLI-related packages
pnpm fern:local               # Run local development CLI
```

### Before Committing
Always run these commands from the repository root before committing changes:
```bash
pnpm lint:biome --fix          # Fix linting issues
pnpm format:fix                # Fix formatting issues
pnpm check:fix                 # Run all checks with fixes
```

## Generation Pipeline Flow

### 1. Workspace Discovery
- **Configuration Loading**: Find and parse `fern.config.json`
- **API Discovery**: Locate API definitions in workspace
- **Generator Configuration**: Parse `generators.yml` files
- **Version Validation**: Check CLI version compatibility

### 2. IR Generation
- **Definition Processing**: Convert Fern definitions to IR
- **Import Processing**: Handle OpenAPI, AsyncAPI, gRPC imports
- **Validation**: Ensure IR is valid and complete
- **Version Management**: Use appropriate IR version

### 3. Generator Execution
- **Version Resolution**: Determine required generator versions
- **IR Migration**: Migrate IR to match generator requirements
- **Container Management**: Pull and run generator Docker images
- **Output Collection**: Gather generated code and artifacts

### 4. Output Delivery
- **Local Output**: Write files to local filesystem
- **Remote Publishing**: Push to npm, PyPI, Maven, NuGet, etc.
- **GitHub Integration**: Create PRs, releases, or pushes
- **Validation**: Verify output integrity and completeness

## Configuration System

### fern.config.json
```json
{
  "version": "0.30.0",           // Required CLI version
  "organization": "acme",        // Organization name
  "default-group": "production"  // Default generator group
}
```

### generators.yml
```yaml
default-group: production
groups:
  production:
    generators:
      - name: fernapi/fern-python-sdk
        version: 0.6.6
        output:
          location: npm
          package-name: "@acme/python-sdk"
```

## API Import System

### Supported Formats
- **OpenAPI 3.x**: Full specification support with extensions
- **AsyncAPI**: Event-driven API specifications
- **gRPC/Protobuf**: Protocol buffer definitions
- **Fern Native**: Native Fern API definitions

### Import Process
1. **Format Detection**: Identify input format automatically
2. **Parsing**: Parse specification into internal representation
3. **Transformation**: Convert to Fern IR format
4. **Validation**: Ensure converted IR is valid
5. **Integration**: Merge with existing workspace definitions

## Version Management System

### CLI Versioning
- **Auto-Update**: CLI automatically downloads required version
- **Version Pinning**: `fern.config.json` specifies required version
- **Migration**: Automatic migration between CLI versions
- **Compatibility**: Backward compatibility with older projects

### Generator Versioning
- **Version Resolution**: Match generator versions to IR compatibility
- **Update Management**: Track latest generator releases
- **Deprecation**: Handle deprecated generator versions
- **Custom Versions**: Support for custom generator builds

## Best Practices

### Command Development
1. **Follow Patterns**: Use existing command structure as template
2. **Error Handling**: Provide clear, actionable error messages
3. **Progress Reporting**: Use task context for long operations
4. **Testing**: Include unit and integration tests

### Configuration Management
1. **Validation**: Validate all configuration inputs
2. **Defaults**: Provide sensible default values
3. **Error Messages**: Clear guidance for configuration errors
4. **Migration**: Handle configuration format changes

### Integration Points
- **Workspace Loader**: Use standard workspace loading patterns
- **Task Context**: Leverage task context for progress tracking
- **Logging**: Use structured logging throughout
- **Error Propagation**: Consistent error handling across packages

## Architecture Patterns

### Command Structure
```typescript
// Standard command pattern
export const myCommand = {
  command: "my-command <arg>",
  describe: "Description of command",
  builder: (yargs) => yargs.option(...),
  handler: async (argv) => { /* implementation */ }
}
```

### Context Management
```typescript
// CLI context for shared state
interface CliContext {
  logger: Logger;
  workspace: FernWorkspace;
  taskContext: TaskContext;
}
```

### Error Handling
```typescript
// Consistent error patterns
try {
  await operation();
} catch (error) {
  context.logger.error("Operation failed", error);
  process.exit(1);
}
```
