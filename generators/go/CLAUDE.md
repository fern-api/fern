# Go Generator (v1 + v2 Tandem)

This file provides guidance for Claude Code when working with the Go generator system.

## Architecture

The Go generator operates as a **tandem system** where v1 runs first, then invokes v2 as a subprocess. v2's output overwrites v1's for files they both produce (notably `client/client.go`).

### v1 (generators/go/) — Native Go

**Entry point**: `cmd/fern-go-sdk/main.go` → `internal/generator/generator.go`

**What v1 generates** (files that survive into final output):
- `core/request_option.go` — **Dynamically generated** in `sdk.go:WriteRequestOptionsDefinition()`. Contains `RequestOptions` struct with auth fields, `TokenGetter` type, `ToHeader()` method, option structs
- `core/oauth.go` — **Static embedded file** at `sdk/core/oauth.go`, included when `hasOAuthScheme()` is true. Contains `OAuthTokenProvider` with token caching
- `core/api_error.go` — Static embedded file
- `option/request_option.go` — **Dynamically generated** in `sdk.go:WriteRequestOptions()`. Public `WithXxx()` helper functions
- Model types (types.go, requests.go) — Generated per-package from IR type declarations
- `go.mod` / `go.sum` — Module configuration

**Key file**: `generators/go/internal/generator/sdk.go` (~1400 lines) — Contains all auth-related generation:
- `WriteRequestOptionsDefinition()` (line ~295) — Generates `core/request_option.go`
- `WriteRequestOptions()` (line ~752) — Generates `option/request_option.go`
- Root client constructor (line ~1145) — Generates auth env vars + OAuth token fetching
- `writeRequestOptionStructs()` (line ~543) — Generates option type structs

**Static file pattern**: Files at `generators/go/internal/generator/sdk/core/*.go` are embedded via `//go:embed` directives at the top of `sdk.go`, then conditionally included in `generator.go` (e.g., `hasOAuthScheme()` → `newOAuthFile()`).

### v2 (generators/go-v2/) — TypeScript

**Entry point**: `sdk/src/SdkGeneratorCli.ts` → `generate()` method

**What v2 generates** (overwrites v1 equivalents):
- `client/client.go` — `ClientGenerator.ts`. Root + subpackage clients. **Constructor includes OAuth/auth token fetching logic**
- `**/raw_client.go` — `RawClientGenerator.ts`. Endpoint method implementations
- `internal/caller.go`, `internal/retrier.go`, etc. — Static "as-is" template files from `base/src/asIs/`
- Wire test files — `WireTestGenerator.ts`, `OAuthWireTestGenerator.ts`
- Dynamic snippets — `dynamic-snippets/src/EndpointSnippetGenerator.ts`

**Key file**: `generators/go-v2/sdk/src/client/ClientGenerator.ts` (~670 lines) — Client generation:
- `getConstructor()` (line ~133) — Builds client constructor with options, subclient instantiation
- `writeEnvironmentVariables()` (line ~213) — Orchestrates auth env vars + token fetching
- `writeAuthEnvironmentVariables()` (line ~234) — Dispatches to per-scheme handlers (basic/bearer/header/oauth)
- `writeOAuthTokenFetching()` (line ~338) — Full OAuth token provider setup in constructor

**As-is files**: Listed in `base/src/AsIs.ts` enum. Template `.go_` files processed with `{{.PackageName}}`, `{{.RootImportPath}}` variables. Written by `GoProject.ts`.

**Context**: `SdkGeneratorContext.ts` — Extends `AbstractGoGeneratorContext`. Provides IR access, type mapping, import path helpers. `getCoreAsIsFiles()` controls which core template files are included.

### Tandem Coordination

v1 invokes v2 via `internal/generator/v2/generator.go`:
- Finds v2 binary at `/bin/go-v2` (Docker) or `GO_V2_PATH` env var (local dev)
- Runs: `node --enable-source-maps <v2-path> <config-path>`
- v2 writes to same output directory, overwriting v1's `client/client.go`

**Who generates what — summary**:
| Output File | Generator | How |
|---|---|---|
| `core/request_option.go` | v1 | Dynamic code generation in `sdk.go` |
| `core/oauth.go` | v1 | Static embedded file |
| `option/request_option.go` | v1 | Dynamic code generation in `sdk.go` |
| `client/client.go` | v2 (overwrites v1) | `ClientGenerator.ts` |
| `**/raw_client.go` | v2 | `RawClientGenerator.ts` |
| `internal/*.go` | v2 | As-is template files |
| Model types (`types.go`, etc.) | v1 | Dynamic from IR |
| `go.mod` | Both (v2 overwrites) | `GoProject.ts` / v1 |

### Auth Implementation Pattern

When adding a new auth scheme, you must modify **both** generators:

1. **v1 `sdk.go`**: Add fields to `RequestOptions` struct, update `ToHeader()`, add option structs, add `SetTokenGetter` if token-based
2. **v1 `generator.go`**: Include any new static core files (e.g., `core/oauth.go`)
3. **v2 `ClientGenerator.ts`**: Add env var handling in `writeAuthEnvironmentVariables()`, add token fetching in constructor for root client
4. **v2 `EndpointSnippetGenerator.ts`**: Add dynamic snippet support for the auth type

**Existing auth schemes and their IR discriminant types**:
- `authScheme.Bearer` / `scheme.type === "bearer"` — Bearer token
- `authScheme.Basic` / `scheme.type === "basic"` — Basic auth
- `authScheme.Header` / `scheme.type === "header"` — Custom header
- `authScheme.Oauth` / `scheme.type === "oauth"` — OAuth client credentials
- `authScheme.Inferred` / `scheme.type === "inferred"` — Inferred auth (token endpoint)

## Key Directories

### Go v1 (generators/go/)
- `internal/generator/sdk.go` — **Core SDK generation** (request options, auth, client constructors)
- `internal/generator/generator.go` — **Orchestrator** (file assembly, static file inclusion)
- `internal/generator/sdk/core/` — Static Go files embedded via `//go:embed`
- `internal/fern/ir/` — Generated Go structs for IR types (auth.go has all auth types)
- `cmd/fern-go-sdk/` — CLI entry point

### Go v2 (generators/go-v2/)
- `sdk/src/client/ClientGenerator.ts` — **Client generation** (constructor, auth wiring)
- `sdk/src/endpoint/http/HttpEndpointGenerator.ts` — Endpoint method generation
- `sdk/src/SdkGeneratorContext.ts` — Central context with IR access and helpers
- `sdk/src/SdkGeneratorCli.ts` — CLI orchestrator
- `base/src/AsIs.ts` — Enum of template files
- `base/src/project/GoProject.ts` — File writing, as-is processing, go fmt
- `dynamic-snippets/src/EndpointSnippetGenerator.ts` — Dynamic code snippets

## Development Commands

### Go v1 Development
```bash
cd generators/go
go build ./...
go test ./...
```

### Go v2 Development
```bash
# From repo root
pnpm turbo run compile --filter @fern-api/go-sdk
```

### Testing Both Generators
```bash
# From repository root — runs both v1 and v2 in sequence
pnpm seed test --generator go-sdk --fixture <fixture-name> --skip-scripts
pnpm seed run --generator go-sdk --path /path/to/project --skip-scripts
```

### Seed Configuration
Fixtures are defined in `seed/go-sdk/seed.yml`. The `fixtures:` section maps fixture names to custom configs. The `allowedFailures:` section lists fixtures expected to fail.

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
