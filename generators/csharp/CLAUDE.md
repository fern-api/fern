# C# Generator

This file provides guidance for Claude Code when working with the C# generator.

## C# and .NET-Specific Requirements

- **Framework compatibility**: Ensure compatibility with target .NET versions (net462;net8.0;net7.0;net6.0;netstandard2.0)
- **IDE support**: Generated code should work well with Visual Studio, VS Code, JetBrains Rider, and the .NET CLI
- **Dependencies**: Avoid unnecessary dependencies; prefer built-in .NET libraries when possible, then Microsoft provided packages, and finally third-party packages
- **Naming conventions**: 
  * Assembly names and namespaces: PascalCase with dots for hierarchy
  * Classes, interfaces, methods, public properties, public constants: PascalCase
  * Private fields: camelCase with leading underscore (e.g., `_myField`) 
- **JSON handling**: 
  * JSON serialization is handled using the built-in System.Text.Json libraries
  * Avoid using reflection for performance and compatibility
- **Async patterns**:
  * Use async/await when an async method is available
  * Pass in a cancellation token when async methods support it
- **Nullable**: Proper handling of nullable reference types and value types

## Key Directories

### C# Generator (generators/csharp/)
- `base/` - Base generator infrastructure
- `codegen/` - Core C# code generation logic
- `sdk/` - C# SDK generator (TypeScript)
- `model/` - C# type generation
- `formatter/` - C# code formatting utilities
- `dynamic-snippets/` - Dynamic code snippet generation

## Development

```bash
pnpm install
pnpm turbo run compile --filter @fern-api/fern-csharp-sdk
pnpm turbo run compile --filter @fern-api/fern-csharp-model
```

### Configuration Options

You can find the configuration options for `generators.yml` in _generators/csharp/codegen/src/custom-config/CsharpConfigSchema.ts_:

## Testing
```bash
# From repository root
pnpm seed test --generator csharp-sdk --fixture <fixture-name> --skip-scripts
pnpm seed run --generator csharp-sdk --path /path/to/test/project --skip-scripts

# From repository root
pnpm seed test --generator csharp-model --fixture <fixture-name> --skip-scripts
pnpm seed run --generator csharp-model --path /path/to/test/project --skip-scripts
```

When working with the C# generator:
- Test generated C# code compiles successfully to the Target Framework Monikers (TFMs)
- Add unit tests for the shared utilities to verify the expected outcome
- Generate JSON serialization/deserialization tests to ensure correct handling of API models
