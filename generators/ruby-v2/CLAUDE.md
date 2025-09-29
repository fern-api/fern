# Ruby-v2 Generator (Standalone)

This file provides guidance for Claude Code when working with the Ruby-v2 generator.

## Architecture

The Ruby-v2 generator is a **standalone modern implementation**:

- **TypeScript-based**: Written in TypeScript using modern generator patterns
- **Standalone Operation**: Does NOT use tandem operation with ruby v1
- **Replacing Legacy**: Ruby-v2 is on the cusp of replacing the ruby generator in GA
- **Modern Architecture**: Clean structure following newer generator design patterns

## Key Directories

### Ruby-v2 (generators/ruby-v2/)
- `ast/` - Ruby AST utilities (TypeScript)
- `base/` - Base generator infrastructure
- `sdk/` - Ruby SDK generator (TypeScript)
- `model/` - Ruby class and module generation
- `dynamic-snippets/` - Dynamic code snippet generation

### Legacy Ruby (generators/ruby/) - Being Replaced
- `cli/` - Legacy CLI implementation
- `codegen/` - Legacy code generation logic
- `sdk/` - Legacy SDK generator
- `model/` - Legacy model generation
- `playground/` - Testing utilities
- Note: This is being phased out in favor of ruby-v2

## Common Issues & Debugging

### Ruby-v2 (Modern) Issues
- **TypeScript compilation**: Standard TS generator patterns apply
- **Ruby syntax generation**: Check `ast/` utilities for Ruby-specific syntax
- **Gem patterns**: Ruby-specific package and dependency patterns
- **Version management**: Ruby version compatibility considerations

### Transition from Legacy Ruby
- **Feature parity**: Ensuring ruby-v2 covers all ruby v1 functionality
- **Migration path**: Existing users transitioning from ruby to ruby-v2
- **Configuration compatibility**: Maintaining backward-compatible config options

## Development Commands

### Ruby-v2 Development
```bash
cd generators/ruby-v2
pnpm install
pnpm compile
```

### Testing
```bash
# From repository root
pnpm seed test --generator ruby-sdk --fixture <fixture-name> --skip-scripts
pnpm seed run --generator ruby-sdk --path /path/to/test/project --skip-scripts
```

## Configuration Options

The Ruby-v2 generator supports configuration in `generators.yml`:

### SDK Generator
- Modern TypeScript-based configuration options
- Ruby-specific settings for gem generation
- Version compatibility settings
- Dependency management options

## Debug Patterns

1. **TypeScript compilation**: Check TS compilation in ruby-v2 directory
2. **Ruby syntax issues**: Examine `ast/` utilities for Ruby language patterns
3. **Gem structure**: Verify generated Ruby gem follows conventions
4. **Version compatibility**: Check Ruby version requirements in generated code
5. **Migration issues**: Compare output with legacy ruby generator for compatibility

## File Patterns

- **Generated Ruby code**: Follows Ruby conventions (snake_case, proper indentation)
- **Gem structure**: Standard Ruby gem directory layout
- **Module organization**: Proper Ruby module and class hierarchy
- **Documentation**: YARD-style documentation comments
- **Testing**: Generated with appropriate Ruby testing patterns

## Ruby-Specific Patterns

- **Naming conventions**: Automatic conversion to Ruby snake_case
- **Module structure**: Proper Ruby module nesting and namespacing
- **Gem specifications**: Gemspec generation and dependency management
- **Error handling**: Ruby exception patterns and custom error classes
- **HTTP clients**: Ruby HTTP library integration (Net::HTTP, Faraday, etc.)
- **JSON handling**: Ruby JSON parsing and serialization patterns

## Transition Notes

Since ruby-v2 is replacing the legacy ruby generator:
- **No tandem operation**: Unlike other languages, ruby-v2 operates independently
- **GA transition**: Currently in process of becoming the default Ruby generator
- **Legacy support**: Legacy ruby generator will be deprecated
- **Feature completeness**: Ensuring all ruby v1 features are available in ruby-v2
- **User migration**: Smooth transition path for existing ruby generator users

## Testing and Validation

When working with ruby-v2:
- Test against existing ruby generator fixtures for compatibility
- Validate Ruby syntax and conventions in generated code
- Check gem structure and metadata
- Verify Ruby version compatibility
- Test integration with popular Ruby frameworks and libraries