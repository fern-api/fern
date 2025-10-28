# TypeScript Generator (Legacy)

This file provides guidance for Claude Code when working with the legacy TypeScript generator.

## Architecture

The TypeScript generator is a **legacy implementation** with the following characteristics:

- **Written in TypeScript**: Ironically, despite being TypeScript-based, this is the older, messier generation
- **Complex Structure**: Evolved over time with accumulated complexity
- **Multiple Outputs**: Generates SDK, Express server, models, and utilities
- **Different from Modern TS Generators**: Uses older patterns compared to newer TypeScript-based generators (java-v2, csharp, etc.)

## Key Directories

### TypeScript Legacy (generators/typescript/)
- `sdk/` - TypeScript SDK generation logic
- `express/` - Express.js server generator
- `model/` - TypeScript type and interface generation
- `utils/` - Shared TypeScript utilities
- `asIs/` - Direct code generation utilities
- `README.md` - Comprehensive configuration documentation

### Express Generator Structure
- `express/cli/` - Express generator CLI
- `express/express-service-generator/` - Service layer generation
- `express/express-register-generator/` - Registration logic
- `express/express-error-generator/` - Error handling generation
- `express/express-inlined-request-body-schema-generator/` - Schema generation
- `express/generator/` - Core Express generator
- `express/generic-express-error-generators/` - Generic error utilities

## Common Issues & Debugging

### Legacy TypeScript Issues
- **Complex dependency chains**: Check node_modules in multiple subdirectories
- **TypeScript compilation errors**: Often due to legacy patterns and technical debt
- **Express integration complexity**: Multiple generators coordinate for Express output
- **Messier patterns**: Less clean than modern TypeScript generators
- **Build system complexity**: Multiple package.json files and build configurations

### Node.js and npm Issues
- **Version compatibility**: Check Node.js version requirements
- **Package resolution**: Multiple nested node_modules can cause conflicts
- **TypeScript version conflicts**: Different TS versions across subprojects

## Development Commands

### TypeScript Legacy Development
```bash
cd generators/typescript
npm install
npm run build
npm run test
```

### Express Generator Development
```bash
cd generators/typescript/express
npm install
npm run build
```

### Testing
```bash
# From repository root
pnpm seed test --generator typescript-sdk --fixture <fixture-name> --skip-scripts
pnpm seed run --generator typescript-sdk --path /path/to/test/project --skip-scripts
```

## Configuration Options

The TypeScript generator supports extensive configuration in `generators.yml`:

### SDK Generator
- `useBrandedStringAliases`: Generate branded strings for type safety
  - Creates types like `string & { __MyString: void }`
  - Provides constructor functions for each branded type
  - Improves compile-time safety at runtime cost
- `neverThrowErrors`: Configure error handling behavior
- `noSerdeLayer`: Skip serialization/deserialization layer generation
- `outputEsm`: Generate ES modules instead of CommonJS
- `includeCredentialsOnCrossOriginRequests`: CORS credential handling
- `allowCustomFetcher`: Enable custom fetch implementation
- `defaultTimeoutInSeconds`: Set default request timeout
- `skipResponseValidation`: Skip runtime response validation

### Express Generator
- Multiple sub-generators coordinate to produce complete Express applications
- Service registration and routing generation
- Error handling middleware generation
- Request/response schema validation

## Debug Patterns

1. **TypeScript compilation**: Check `tsc` output in each subproject
2. **Complex build errors**: Often require examining multiple package.json files
3. **Express coordination**: Multiple generators must work together successfully
4. **Legacy patterns**: May require understanding older TypeScript conventions
5. **Node.js module resolution**: Check for conflicts in nested node_modules

## File Patterns

- **Generated TypeScript code**: Follows older TS conventions
- **Import/export patterns**: Mix of CommonJS and ES module patterns
- **Type definitions**: Complex type hierarchies due to legacy evolution
- **Error handling**: Traditional promise/callback patterns alongside modern async/await
- **Documentation**: JSDoc comments generated from API descriptions

## Comparison to Modern Generators

Unlike the modern TypeScript-based generators (java-v2, csharp, etc.):
- **More complex**: Accumulated technical debt over time
- **Less consistent**: Multiple patterns and conventions
- **Harder to modify**: Tightly coupled components
- **More features**: Extensive configuration options due to long evolution
- **Battle-tested**: Mature with many edge cases handled

## Migration Considerations

When working on this generator:
- **Understand legacy context**: Many patterns exist for historical reasons
- **Test thoroughly**: Changes can have unexpected effects due to complexity
- **Consider modern alternatives**: Some features may be better implemented in newer generators
- **Maintain backward compatibility**: This generator has many existing users
