# Seed Testing Framework

This file provides guidance for Claude Code when working with the Seed testing framework.

## Overview

Seed is Fern's **comprehensive generator testing framework** that validates generator changes against test fixtures across all supported languages. It's essential for bug fixes, feature development, and ensuring generator quality.

## Architecture

- **TypeScript CLI**: Command-line tool for orchestrating generator tests
- **Docker Integration**: Runs generators in Docker containers for isolation
- **Parallel Execution**: Uses semaphores for concurrent test execution
- **Cross-Language**: Tests all generators (Python, Java, Go, TypeScript, etc.)
- **Fixture-Based**: Predefined test cases with expected outputs

## Key Directories

### packages/seed/
- `src/cli.ts` - Main CLI entry point (40K+ lines)
- `src/commands/` - Individual command implementations
- `src/config/` - Configuration loading and validation
- `src/utils/` - Utilities for workspace management, logging, etc.
- `fern/` - Seed's own Fern API definitions
- `build.cjs` - CLI distribution build script

### Command Structure
- `test/` - Run predefined fixtures against generators
- `run/` - Run custom projects against generators
- `generate/` - Generate fixtures and update outputs
- `publish/` - Publish generated outputs
- `validate/` - Validate generator configurations
- `register/` - Register new generator workspaces
- `latest/` - Get latest generator versions

## Core Commands

### Test Command (`pnpm seed test`)
```bash
# Test specific generator and fixture
pnpm seed test --generator python-sdk --fixture file-download --skip-scripts

# Test all fixtures for a generator
pnpm seed test --generator java-sdk --skip-scripts

# Parallel execution with custom concurrency
pnpm seed test --generator typescript-sdk --parallel 4
```

### Run Command (`pnpm seed run`)
```bash
# Test custom project against generator
pnpm seed run --generator go-sdk --path /path/to/project --skip-scripts

# Test with specific IR version
pnpm seed run --generator python-sdk --path ./custom-api --ir-version 58
```

### Remote vs Local Comparison Command (`pnpm seed test-remote-vs-local`)
```bash
# Compare remote and local generation outputs
pnpm seed test-remote-vs-local \
  --workspace-path /path/to/fern/workspace \
  --remote-group ts-sdk-remote \
  --local-group ts-sdk-local \
  --github-repo owner/repo

# Save comparison report to file
pnpm seed test-remote-vs-local \
  --workspace-path /path/to/fern/workspace \
  --remote-group ts-sdk-remote \
  --local-group ts-sdk-local \
  --github-repo owner/repo \
  --output-report ./comparison-report.txt
```

This command validates that remote generation (server-side via Fiddle service) produces identical output to local generation (Docker-based local execution) for the same generator configuration and API specification.

### Development Workflow
```bash
# Initial setup
pnpm seed:build                    # Build seed CLI

# Development cycle
pnpm seed test --generator python-sdk --fixture basic-auth
# Modify generator code
pnpm seed test --generator python-sdk --fixture basic-auth
git diff seed/python-sdk/basic-auth/  # See output changes
```

## Common Issues & Debugging

### Generator Execution Issues
- **Docker Problems**: Check `docker ps` for running containers
- **Build Failures**: Generator Docker image fails to build
- **Timeout Issues**: Long-running generators exceed timeout limits
- **Permission Issues**: Docker volume mounting problems

### Output Validation Issues
- **Snapshot Mismatches**: Generated output differs from expected
- **File System Issues**: Path resolution problems across platforms
- **Script Execution**: Language-specific build/test scripts fail
- **Dependency Resolution**: Generated code has dependency conflicts

### Performance Issues
- **Parallel Execution**: Semaphore limits and resource contention
- **Docker Overhead**: Container startup and teardown delays
- **Large Fixtures**: Memory usage for complex test cases
- **Network Issues**: Docker registry and dependency downloads

## Development Commands

### Seed CLI Development
```bash
cd packages/seed
pnpm compile                  # Compile TypeScript
pnpm dist:cli                # Build distributable CLI
pnpm test                    # Run seed's own tests
```

### Generator Testing
```bash
# From repository root
pnpm seed:build              # Build seed CLI binary
pnpm test:update            # Update test snapshots
pnpm test:ete:update        # Update end-to-end test snapshots
```

## Configuration & Workspace Management

### Workspace Loading
- **Auto-Discovery**: Finds generator workspaces in `/generators/`
- **Configuration Files**: Reads generator metadata and requirements
- **Version Management**: Tracks generator versions and IR compatibility
- **Dependency Resolution**: Manages generator build dependencies

### Fixture Management
- **Test Definitions**: Located in `/test-definitions/`
- **Output Storage**: Results stored in `/seed/<generator>/<fixture>/`
- **Snapshot Testing**: Compares current output to stored snapshots
- **Update Workflow**: `--update` flag regenerates expected outputs

## Parallel Execution System

### Semaphore Management
- **Concurrency Control**: Limits simultaneous generator executions
- **Resource Management**: Prevents Docker resource exhaustion
- **Progress Tracking**: Real-time status of parallel operations
- **Error Isolation**: Failures in one test don't affect others

### Performance Optimization
```typescript
// Key components in src/
TaskContextImpl.ts          // Task coordination and progress
Semaphore.ts               // Concurrency limiting
Stopwatch.ts              // Performance measurement
```

## Integration Points

### CLI Integration
- Uses `@fern-api/workspace-loader` for workspace discovery
- Integrates with `@fern-api/configuration` for config management
- Leverages `@fern-api/task-context` for progress tracking

### Generator Integration
- Communicates with generators via Docker API
- Passes IR files and configuration to generator containers
- Collects generated output and logs from containers

### Testing Integration
- Used by main test suite (`pnpm test:ete`)
- Integrates with snapshot testing for output validation
- Provides fixtures for cross-generator compatibility testing

## Best Practices

### Adding New Fixtures
1. **Create Test Definition**: Define API in `/test-definitions/`
2. **Generate Initial Output**: Run seed to create baseline
3. **Validate Output**: Ensure generated code compiles and works
4. **Commit Changes**: Include both definition and expected output
5. **Update Documentation**: Document the fixture's purpose

### Debugging Generator Issues
1. **Isolate Problem**: Use specific generator/fixture combination
2. **Check Logs**: Examine Docker container logs for errors
3. **Validate Input**: Ensure IR and configuration are correct
4. **Compare Output**: Use `git diff` to see output changes
5. **Test Incrementally**: Make small changes and re-test

### Performance Optimization
- **Use Filters**: Target specific generators/fixtures
- **Parallel Execution**: Leverage `--parallel` flag appropriately
- **Skip Scripts**: Use `--skip-scripts` to avoid unnecessary builds
- **Docker Cleanup**: Regularly clean up Docker images and containers

## Command Reference

### Common Flags
- `--generator <name>` - Target specific generator
- `--fixture <name>` - Target specific fixture
- `--skip-scripts` - Skip language-specific build/test scripts
- `--parallel <n>` - Set concurrency level
- `--update` - Update expected outputs (snapshots)
- `--ir-version <n>` - Use specific IR version

### Useful Combinations
```bash
# Quick validation (no scripts)
pnpm seed test --generator python-sdk --skip-scripts

# Full integration test
pnpm seed test --generator java-sdk --fixture pagination

# Update all snapshots for generator
pnpm seed test --generator typescript-sdk --update --skip-scripts

# Custom project testing
pnpm seed run --generator go-sdk --path ./my-api --skip-scripts
```
