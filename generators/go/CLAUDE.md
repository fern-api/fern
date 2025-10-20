# Go Generator (v1 + v2 Tandem)

This file provides guidance for Claude Code when working with the Go generator system.

## Architecture

The Go generator operates as a **tandem system** with both v1 and v2 implementations:

- **v1 (generators/go/)**: Native Go implementation (legacy)
  - Written in Go using standard Go toolchain
  - Generates: SDK, models, Fiber server
  - Uses `go.mod`, `go.sum` for dependency management
  - Includes comprehensive Go module configuration options

- **v2 (generators/go-v2/)**: TypeScript-based implementation (modern)
  - Written in TypeScript with cleaner architecture
  - Structured as: `ast/`, `base/`, `dynamic-snippets/`, `formatter/`, `model/`, `sdk/`
  - Uses improved patterns from newer generator design

- **Docker Integration**: Both v1 and v2 run in a single Docker image and coordinate during generation

## Key Directories

### Go v1 (generators/go/)
- `sdk/` - Go SDK generation logic
- `model/` - Go struct and type generation
- `fiber/` - Fiber server generator (Go web framework)
- `cmd/` - Command-line tools (`fern-go-sdk`, `fern-go-fiber`, `fern-go-model`)
- `internal/` - Internal Go utilities (`goexec/`, `gospec/`)
- `go.mod` / `go.sum` - Go module definition and dependencies
- `Makefile` - Build automation
- `version.go` - Version information

### Go v2 (generators/go-v2/)
- `ast/` - Go AST utilities (TypeScript)
- `base/` - Base generator infrastructure
- `sdk/` - SDK generator (TypeScript)
- `model/` - Model generator (TypeScript)
- `formatter/` - Go code formatting utilities
- `dynamic-snippets/` - Dynamic code snippet generation

## Common Issues & Debugging

### v1 (Native Go) Issues
- **Go module issues**: Run `go mod tidy` in generators/go/
- **Build failures**: Use `make build` or `go build ./...`
- **Import path conflicts**: Check `importPath` vs `module` configuration
- **Go version compatibility**: Supports Go 1.13+ (1.18+ for explicit null feature)
- **Dependency resolution**: Check `go.sum` for version locks

### v2 (TypeScript) Issues
- **TypeScript compilation**: Standard TS generator patterns apply
- **AST generation**: Issues often in `ast/` utilities for Go syntax
- **Formatting**: Check `formatter/` for gofmt-style code generation

### Tandem Operation Issues
- **Module configuration conflicts**: v1 and v2 must agree on module structure
- **Import path resolution**: Both generators must use consistent import paths
- **Docker coordination**: Both generators must build successfully in container

## Development Commands

### Go v1 Development
```bash
cd generators/go
go mod tidy
make build
go test ./...
```

### Go v2 Development
```bash
cd generators/go-v2
pnpm install
pnpm compile
```

### Testing Both Generators
```bash
# From repository root
pnpm seed test --generator go-sdk --fixture <fixture-name> --skip-scripts
pnpm seed run --generator go-sdk --path /path/to/test/project --skip-scripts
```

## Configuration Options

The Go generator supports extensive configuration in `generators.yml`:

### Package Configuration
- `packageName`: Custom package name (default: derived from API name)
- `importPath`: Import path for internal module usage
- `module.path`: Module path for separate module generation
- `module.version`: Go version for generated `go.mod` (default: "1.13")

### Advanced Features
- `enableExplicitNull`: Generate `Optional[T]` type for explicit null handling
  - Requires Go 1.18+ for generics
  - Provides `Optional()` and `Null[T]()` constructor functions
  - Useful for PATCH endpoints with explicit null semantics

### Generation Modes
- **Internal usage**: Use `importPath` for same-module integration
- **Separate module**: Use `module` config for independent distribution
- **Replace statements**: Use `go.mod` replace for local development

## Debug Patterns

1. **Go compilation errors**: Check generated Go syntax and imports
2. **Module resolution issues**: Verify `go.mod` and import path configuration
3. **Build failures**: Run `go build` on generated output to identify issues
4. **Runtime panics**: Check nil pointer handling and type assertions
5. **JSON serialization**: Verify struct tags and json package usage

## File Patterns

- **Generated Go code**: Follows Go conventions (PascalCase exports, camelCase unexports)
- **Package structure**: Clean, hierarchical package organization
- **Import management**: Automatic import grouping and optimization
- **Error handling**: Idiomatic Go error patterns
- **JSON tags**: Automatic struct tag generation for serialization
- **Documentation**: Go doc comments generated from API descriptions

## Common Go-Specific Patterns

- **Pointer vs value semantics**: Appropriate use of pointers for optional fields
- **Context propagation**: `context.Context` passed through all operations
- **Error wrapping**: Uses `fmt.Errorf` with `%w` verb for error chains
- **Interface design**: Minimal, focused interfaces following Go conventions
- **Zero values**: Leverages Go's zero value semantics appropriately
- **HTTP client**: Uses `net/http` standard library with optional transport customization
