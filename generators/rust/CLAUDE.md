# Rust Generator

This file provides guidance for Claude Code when working with the Rust generator.

## Rust-Specific Requirements

- **Framework compatibility**: Generated code targets modern Rust (2021 edition+) with tokio async runtime
- **Dependencies**: Minimize dependencies; prefer serde for serialization, reqwest for HTTP
- **Naming conventions**:
  * Crate names and modules: snake_case
  * Structs, enums, traits: PascalCase
  * Functions, methods, variables: snake_case
  * Constants: SCREAMING_SNAKE_CASE
- **Async patterns**: Use async/await with tokio runtime for all I/O operations
- **Error handling**: Use Result<T, E> with custom error types
- **Formatting**: All code must pass `rustfmt` and `cargo clippy`

## Key Directories

### Rust Generator (generators/rust/)
- `base/` - Base generator infrastructure (CLI, context, project management)
- `codegen/` - Rust AST builder and code generation primitives
- `sdk/` - Full SDK generator with HTTP client
- `model/` - Rust type generation (structs, enums, unions)
- `dynamic-snippets/` - Code example generation

## Key Architectural Patterns

**Five-Package Structure**:
1. **base/** - Shared infrastructure (`AbstractRustGeneratorCli`, `RustProject`, `RustFilenameRegistry`)
2. **codegen/** - AST builder (`Writer`, `Struct`, `Enum`, `Method`, etc.)
3. **model/** - Type generation (structs, enums, unions, aliases)
4. **sdk/** - Full SDK with HTTP client, pagination, error handling
5. **dynamic-snippets/** - Code example generation

**Filename Collision Resolution**: Priority-based registration system appends `_type` suffix to resolve conflicts (e.g., `user.rs` → `user_type.rs`). Don't bypass `RustFilenameRegistry`.

**Template Variables**: Static files in `/base/src/asIs/` use placeholders like `{{PACKAGE_NAME}}`, `{{PACKAGE_VERSION}}` replaced by `RustProject.replaceTemplateVariables()`.

**Dual-Generator Pattern**: SDK composes model generator via `generateModels({ context: sdkContext.toModelGeneratorContext() })` for consistency.

## Development

```bash
pnpm install
pnpm --filter @fern-api/rust-sdk compile
pnpm --filter @fern-api/rust-model compile
pnpm --filter @fern-api/rust-sdk dist:cli    # Build Docker CLI
pnpm --filter @fern-api/rust-model dist:cli  # Build Docker CLI
```

### Configuration Options

Configuration schema: `generators/rust/codegen/src/custom-config/RustSdkCustomConfigSchema.ts` and `RustModelCustomConfigSchema.ts`

## Testing

```bash
# From repository root
pnpm seed test --generator rust-sdk --fixture <fixture-name> --skip-scripts
pnpm seed test --generator rust-model --fixture <fixture-name> --skip-scripts
```

When working with the Rust generator:
- Verify generated code compiles: `cd seed/rust-sdk/<fixture> && cargo build`
- Run generated tests: `cargo test`
- Validate formatting: `cargo fmt --check && cargo clippy`
- Check AST node tests with vitest snapshots: `pnpm test:update --filter @fern-api/rust-codegen`
