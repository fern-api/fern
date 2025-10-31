# Java Generator (v1 + v2 Tandem)

This file provides guidance for Claude Code when working with the Java generator system.

## Architecture

The Java generator operates as a **tandem system** where v1 calls v2 as part of its generation process. **Important: This is NOT yet a true separation into two independent generator versions.** Instead, v1 contains the core SDK generation functionality and invokes v2 for supplementary features.

### Java v1 (generators/java/)
- **Language**: Native Java implementation using Gradle for build management
- **Primary Responsibilities**:
  - Core SDK generation (client classes, request/response models, authentication)
  - Model/POJO generation with Jackson annotations
  - Spring Boot server generator
  - Error handling classes
  - HTTP client infrastructure (OkHttp-based)
  - Gradle build configuration and dependency management
- **Status**: Mature, feature-complete codebase with extensive configuration options

### Java v2 (generators/java-v2/)
- **Language**: TypeScript-based implementation with cleaner architecture
- **Structure**: `ast/`, `base/`, `dynamic-snippets/`, `sdk/`
- **Primary Responsibilities**:
  - README.md generation
  - reference.md generation
  - Dynamic snippet generation for documentation
  - Wire test generation
- **Status**: Supplementary generator focused on documentation and testing artifacts

### How v1 Calls v2

**Key Implementation Details**:
1. **Entry Point**: `generators/java/sdk/src/main/java/com/fern/java/client/Cli.java:118-121`
   - The `runV2Generator()` method is called as part of the v1 generation lifecycle
   - This is an abstract method defined in `AbstractGeneratorCli` that all Java generators must implement

2. **Adapter Pattern**: `generators/java/generator-utils/src/main/java/com/fern/java/JavaV2Adapter.java`
   - Wraps the Node.js execution of the v2 generator
   - Executes: `node /bin/java-v2 <config-path>`
   - Streams stdout/stderr from v2 back to v1's logging system
   - Fails the entire generation if v2 exits with non-zero code

3. **Docker Packaging**: `generators/java/sdk/Dockerfile`
   - Multi-stage build: First stage builds v2 (Node.js), second stage builds v1 (Java/Gradle)
   - v2 CLI compiled to `/bin/java-v2` and made executable
   - Both Node.js runtime and v2 CLI copied into the final Java-based image
   - Single Docker image contains both generators

4. **Execution Flow**:
   ```
   User runs: fern generate
   ↓
   CLI invokes Java generator Docker container
   ↓
   v1 generator starts (Java/Gradle)
   ↓
   v1 generates core SDK code (models, clients, errors, etc.)
   ↓
   v1 calls runV2Generator() via JavaV2Adapter
   ↓
   v2 generator executes (Node.js/TypeScript)
   ↓
   v2 generates README.md, reference.md, snippets, wire tests
   ↓
   Both outputs combined in final SDK package
   ```

### Why This Isn't a True Separation Yet

- v1 **always** calls v2 as part of its generation process
- Users cannot choose to run only v1 or only v2
- There's no separate `fernapi/fern-java-v2` generator users can configure
- v2 is essentially a sub-module of v1, not an independent generator version
- The tandem system exists in a single Docker image and single generator invocation

## Key Directories

### Java v1 (generators/java/)
- `sdk/` - Core Java SDK generation logic (clients, endpoints, authentication)
- `sdk/src/main/java/com/fern/java/client/Cli.java` - Main entry point, calls v2 via `runV2Generator()`
- `model/` - Java model/POJO generation with Jackson serialization
- `spring/` - Spring Boot server generator
- `generator-utils/` - Shared Java utilities including `JavaV2Adapter` and `JavaV2Arguments`
- `generator-utils/src/main/java/com/fern/java/JavaV2Adapter.java` - Adapter that invokes v2 generator
- `build.gradle` - Gradle build configuration
- `versions.props` - Dependency version management
- `gradlew` / `gradlew.bat` - Gradle wrapper scripts
- `sdk/Dockerfile` - Multi-stage Docker build that packages both v1 and v2

### Java v2 (generators/java-v2/)
- `ast/` - Java AST utilities (TypeScript) for code generation
- `base/` - Base generator infrastructure shared with other TypeScript generators
- `sdk/` - SDK supplementary generator (README, reference, snippets, wire tests)
- `sdk/src/SdkGeneratorCli.ts` - Main v2 CLI entry point
- `sdk/src/cli.ts` - CLI wrapper that disables notifications (to avoid conflicts with v1)
- `dynamic-snippets/` - Dynamic code snippet generation for documentation
- `sdk/src/readme/` - README.md generation logic
- `sdk/src/reference/` - reference.md generation logic
- `sdk/src/sdk-wire-tests/` - Wire test generation for SDK validation

## Common Issues & Debugging

### v1 (Native Java) Issues
- **Gradle build failures**: Run `./gradlew build` in generators/java/
- **Dependency conflicts**: Check `versions.props` and `versions.lock`
- **Java compilation errors**: Check Java source compatibility (Java 8+)
- **Spring configuration issues**: Check Spring Boot version compatibility
- **Null handling**: Uses Optional patterns and @Nullable annotations
- **Core SDK generation**: Models, clients, authentication, error handling

### v2 (TypeScript) Issues
- **TypeScript compilation**: Standard TS generator patterns apply
- **AST generation**: Issues often in `ast/` utilities for Java syntax
- **Dynamic snippets**: Check `dynamic-snippets/` for code generation issues
- **README/reference generation**: Check `sdk/src/readme/` and `sdk/src/reference/`
- **Wire test failures**: Check `sdk/src/sdk-wire-tests/` for test generation logic

### Tandem Operation Issues
- **v2 invocation failures**: Check `JavaV2Adapter.java` for Node.js execution issues
- **v2 not found**: Verify `/bin/java-v2` exists in Docker image (check Dockerfile)
- **v2 exit code errors**: v1 will fail if v2 exits with non-zero code; check v2 logs
- **Docker build failures**: Both generators must build successfully in single image
- **Missing README/reference**: v2 may fail silently; check logs for warnings
- **Notification conflicts**: v2 disables notifications to avoid interfering with v1's remote generation
- **Output coordination**: v1 generates SDK code, v2 generates documentation/tests - no overlap

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
