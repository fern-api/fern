# Java Generator (v1 + v2 Tandem)

This file provides guidance for Claude Code when working with the Java generator system.

## Architecture

The Java generator operates as a **tandem system** with both v1 and v2 implementations:

- **v1 (generators/java/)**: Native Java implementation (legacy)
  - Written in Java using Gradle for build management
  - Generates: SDK, models, Spring server
  - Complex, mature codebase with extensive configuration options

- **v2 (generators/java-v2/)**: TypeScript-based implementation (modern)
  - Written in TypeScript with cleaner architecture
  - Structured as: `ast/`, `base/`, `dynamic-snippets/`, `sdk/`
  - Uses improved patterns from newer generator design

- **Docker Integration**: Both v1 and v2 run in a single Docker image and coordinate during generation

## Key Directories

### Java v1 (generators/java/)
- `sdk/` - Java SDK generation logic
- `model/` - Java model/POJO generation
- `spring/` - Spring Boot server generator
- `generator-utils/` - Shared Java utilities
- `build.gradle` - Gradle build configuration
- `versions.props` - Dependency version management
- `gradlew` / `gradlew.bat` - Gradle wrapper scripts

### Java v2 (generators/java-v2/)
- `ast/` - Java AST utilities (TypeScript)
- `base/` - Base generator infrastructure
- `sdk/` - SDK generator (TypeScript)
- `dynamic-snippets/` - Dynamic code snippet generation

## Common Issues & Debugging

### v1 (Native Java) Issues
- **Gradle build failures**: Run `./gradlew build` in generators/java/
- **Dependency conflicts**: Check `versions.props` and `versions.lock`
- **Java compilation errors**: Check Java source compatibility (Java 8+)
- **Spring configuration issues**: Check Spring Boot version compatibility
- **Null handling**: Uses Optional patterns and @Nullable annotations

### v2 (TypeScript) Issues
- **TypeScript compilation**: Standard TS generator patterns apply
- **AST generation**: Issues often in `ast/` utilities for Java syntax
- **Dynamic snippets**: Check `dynamic-snippets/` for code generation issues

### Tandem Operation Issues
- **Version mismatches**: Ensure IR versions are compatible between v1 and v2
- **Docker build failures**: Both generators must build successfully in single image
- **Output coordination**: Check that v1 and v2 don't conflict in their responsibilities

## Development Commands

### Java v1 Development
```bash
cd generators/java
./gradlew build
./gradlew test
```

### Java v2 Development
```bash
cd generators/java-v2
pnpm install
pnpm compile
```

### Testing Both Generators
```bash
# From repository root
pnpm seed test --generator java-sdk --fixture <fixture-name> --skip-scripts
pnpm seed run --generator java-sdk --path /path/to/test/project --skip-scripts
```

## Configuration Options

The Java generator supports extensive configuration in `generators.yml`:

### SDK Generator
- `unknown-as-optional`: Define unknowns as `Optional<Object>` vs plain `Object`
- `wrapped-aliases`: Generate wrapper types for aliases (type safety vs simplicity)
- `use-nullable-annotation`: Distinguish `@Nullable T` from `Optional<T>`

### Spring Generator
- `wrapped-aliases`: Generate wrapper types for aliases
- `use-nullable-annotation`: Use `@Nullable` vs `Optional<T>`
- `enable-public-constructors`: Generate public constructors for models
- `client-class-name`: Customize generated client class name
- `custom-dependencies`: Add custom Gradle dependencies

### Model Generator
- Generates POJOs with Jackson annotations
- Supports inheritance and polymorphic types
- Handles Java naming conventions automatically

## Debug Patterns

1. **Gradle build issues**: Check `./gradlew build` output in generators/java/
2. **Generated code compilation**: Java compilation errors often indicate AST issues
3. **Spring Boot integration**: Check Spring-specific annotations and configurations
4. **Null safety**: Review Optional vs @Nullable usage patterns
5. **Docker coordination**: Verify both v1 and v2 build successfully in container

## File Patterns

- **Generated Java code**: Follows Java conventions (PascalCase classes, camelCase methods)
- **Package structure**: Uses reverse domain notation (com.company.api)
- **Imports**: Automatic import optimization and organization
- **Annotations**: Jackson for JSON, Spring for web, @Nullable for null safety
- **Documentation**: JavaDoc comments generated from API descriptions

## Common Java-Specific Patterns

- **Builder patterns**: Generated for complex object construction
- **Immutable types**: Objects typically immutable with builders
- **Exception handling**: Custom exception types for API errors
- **HTTP clients**: Uses OkHttp or similar for network requests
- **JSON handling**: Jackson for serialization/deserialization