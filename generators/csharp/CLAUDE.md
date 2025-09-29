# C# Generator (Modern)

This file provides guidance for Claude Code when working with the C# generator.

## Architecture

The C# generator is a **modern TypeScript-based implementation**:

- **TypeScript-based**: Written in TypeScript using modern generator patterns
- **Clean Architecture**: Follows the improved patterns seen in newer generators
- **Standalone Operation**: No legacy version - purely modern implementation
- **Structured Design**: Well-organized with clear separation of concerns

## Key Directories

### C# Generator (generators/csharp/)
- `base/` - Base generator infrastructure
- `codegen/` - Core C# code generation logic
- `sdk/` - C# SDK generator (TypeScript)
- `model/` - C# class and type generation
- `formatter/` - C# code formatting utilities
- `dynamic-snippets/` - Dynamic code snippet generation
- `csharp.sln` - C# solution file for generated code structure

## Common Issues & Debugging

### C# Generator Issues
- **TypeScript compilation**: Standard TS generator patterns apply
- **C# syntax generation**: Check `codegen/` utilities for C# language patterns
- **NuGet patterns**: .NET package and dependency management
- **Framework compatibility**: .NET Framework vs .NET Core/5+ considerations
- **Namespace organization**: C# namespace and assembly patterns

### .NET-Specific Issues
- **Package references**: NuGet package management and versioning
- **Target framework**: Multi-targeting different .NET versions
- **Assembly loading**: Generated assembly structure and dependencies
- **Serialization**: JSON.NET vs System.Text.Json patterns

## Development Commands

### C# Generator Development
```bash
cd generators/csharp
pnpm install
pnpm compile
```

### Testing
```bash
# From repository root
pnpm seed test --generator csharp-sdk --fixture <fixture-name> --skip-scripts
pnpm seed run --generator csharp-sdk --path /path/to/test/project --skip-scripts
```

## Configuration Options

The C# generator supports configuration in `generators.yml`:

### SDK Generator
- Modern TypeScript-based configuration options
- C#-specific settings for NuGet package generation
- .NET framework targeting options
- Dependency management configuration
- Namespace and assembly naming options

## Debug Patterns

1. **TypeScript compilation**: Check TS compilation in csharp directory
2. **C# syntax issues**: Examine `codegen/` utilities for C# language patterns
3. **NuGet structure**: Verify generated NuGet package follows conventions
4. **Framework compatibility**: Check .NET version requirements in generated code
5. **Assembly structure**: Verify proper C# namespace and class organization

## File Patterns

- **Generated C# code**: Follows C# conventions (PascalCase, proper indentation)
- **Project structure**: Standard .NET project layout with .csproj files
- **Namespace organization**: Proper C# namespace hierarchy
- **Documentation**: XML documentation comments for IntelliSense
- **Testing**: Generated with appropriate C# testing patterns

## C#-Specific Patterns

- **Naming conventions**: Automatic conversion to C# PascalCase conventions
- **Namespace structure**: Proper C# namespace nesting and organization
- **NuGet packaging**: Package specification and dependency management
- **Error handling**: C# exception patterns and custom exception classes
- **HTTP clients**: HttpClient integration with proper disposal patterns
- **JSON handling**: Newtonsoft.Json or System.Text.Json serialization
- **Async patterns**: Proper async/await implementation throughout
- **Property patterns**: C# property syntax with getters/setters
- **Nullable types**: C# nullable reference types and null safety

## Modern Generator Benefits

As a modern TypeScript-based generator:
- **Clean codebase**: No legacy technical debt
- **Consistent patterns**: Follows established modern generator conventions
- **Maintainable**: Well-structured and easy to modify
- **Extensible**: Clear architecture for adding new features
- **Type-safe**: Generated code follows C# type safety best practices

## Testing and Validation

When working with the C# generator:
- Test generated C# code compiles successfully with target .NET versions
- Validate NuGet package structure and metadata
- Check C# naming conventions and code style
- Verify proper async/await patterns
- Test integration with popular C# frameworks and libraries
- Validate JSON serialization/deserialization patterns

## Integration Considerations

- **Framework compatibility**: Ensure compatibility with target .NET versions
- **Dependency management**: Proper NuGet package version management
- **IDE support**: Generated code should work well with Visual Studio and VS Code
- **CI/CD integration**: Generated projects should build in standard .NET pipelines