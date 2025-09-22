# Fern Project Knowledge Base

## Project Overview

Look @ CLAUDE.sessions.md for also more info 

Fern is a comprehensive toolkit for API development that transforms API definitions (OpenAPI or Fern Definition format) into multiple artifacts:
- **Client SDKs** in 8+ languages (TypeScript, Python, Java, Go, C#, Ruby, PHP, Swift)
- **Server stubs** for various frameworks (Express, Spring Boot, FastAPI)
- **API documentation websites** with search, SEO, and customization
- **Postman collections** and other tooling

## Codebase Architecture

### Core Structure
```
fern/
├── fern/                    # Documentation, assets, and configuration
├── generators/              # Language-specific code generators (20+ generators)
├── packages/               # CLI and core TypeScript packages
├── seed/                   # Test cases and examples for all generators
├── shared/                 # Shared utilities and configurations
└── scripts/                # Build and deployment scripts
```

### Key Components
- **CLI**: TypeScript-based CLI tool (`fern-api` npm package)
- **Generator Framework**: Shared base classes and utilities for all generators
- **IR (Intermediate Representation)**: Language-agnostic API structure (v58 current)
- **Docker Containerization**: All generators run in Docker for consistency
- **Monorepo**: pnpm workspace with turbo for build orchestration

## Java SDK Generator Deep Dive

### Dual Implementation Strategy

Fern maintains **two Java generator implementations**:

#### 1. Legacy Java Generator (`generators/java/`)
- **Language**: Java with Gradle build system
- **Maturity**: Production-ready, feature-complete
- **Components**:
  - `fern-java-model` - POJO/data model generation
  - `fern-java-sdk` - Client SDK generation (v2.38.1)
  - `fern-java-spring` - Spring Boot server stub generation
- **Architecture**: JavaPoet-based code generation with visitor patterns

#### 2. Java-v2 Generator (`generators/java-v2/`)
- **Language**: TypeScript (aligned with modern Fern architecture)
- **Focus**: SDK generation with enhanced features
- **Architecture**: Custom Java AST with TypeScript-based generation
- **Migration**: Called from legacy generator via adapter pattern

### Java Generator Features

#### Core Capabilities
- **Type Safety**: Wrapped aliases, Optional<T>, compile-time validation
- **Authentication**: Bearer, Basic Auth, OAuth2, custom schemes with auto-refresh
- **Error Handling**: Typed exceptions for all HTTP error responses
- **Pagination**: Iterable<T> with streaming support, cursor/offset pagination
- **Async/Sync**: Both synchronous and asynchronous client generation
- **Retries**: Exponential backoff with configurable policies
- **Connection Management**: OkHttp-based with pooling and timeouts

#### Advanced Type System
- **Union Types**: Visitor pattern for discriminated, type-safe undiscriminated
- **Builder Pattern**: Staged builders with compile-time validation
- **Collections**: Type-safe generics for List<T>, Set<T>, Map<K,V>
- **Enums**: Forward-compatible with unknown value handling
- **Jackson Integration**: Full JSON serialization with custom deserializers

#### Enterprise Features
- **Maven Central Publishing**: Automated with signing and metadata
- **Custom Dependencies**: Support for additional Maven/Gradle dependencies
- **Package Layouts**: Flat or nested package structures
- **Thread Safety**: Lazy initialization with Suppliers.memoize()
- **Memory Efficiency**: Optimal object lifecycle management

### Generated Code Patterns

#### Model Generation Example
```java
@JsonInclude(JsonInclude.Include.NON_ABSENT)
@JsonDeserialize(builder = ObjectWithOptionalField.Builder.class)
public final class ObjectWithOptionalField {
    private final Optional<String> string;
    
    // Staged builder pattern with interfaces
    public interface NameStage {
        NextStage name(String name);
    }
    
    // Immutable with proper equals/hashCode/toString
}
```

#### Client Generation Example
```java
public final class ApiClientBuilder {
    private ClientOptions.Builder clientOptionsBuilder = ClientOptions.builder();
    
    public ApiClientBuilder bearerToken(String token) {
        this.clientOptionsBuilder.addHeader("Authorization", "Bearer " + token);
        return this;
    }
    
    public ApiClient build() {
        return new ApiClient(clientOptionsBuilder.build());
    }
}
```

#### Union Type Example
```java
public final class Animal {
    public <T> T visit(Visitor<T> visitor) {
        return value.visit(visitor);
    }
    
    public interface Visitor<T> {
        T visitDog(Dog dog);
        T visitCat(Cat cat);
        T _visitUnknown(Object unknownType);
    }
}
```

### Configuration Options

```yaml
generators:
  - name: fernapi/fern-java-sdk
    config:
      # Type Safety
      wrapped-aliases: true
      enable-forward-compatible-enums: true
      
      # Package Structure
      package-layout: flat # or nested
      package-prefix: "com.mycompany"
      
      # Naming
      client-class-name: "MyApiClient"
      base-api-exception-class-name: "ApiError"
      
      # Serialization
      json-include: non-absent # or non-empty
      
      # Publishing
      publish-to: central # or ossrh
      
      # Dependencies
      custom-dependencies:
        - "implementation com.foo:bar:0.0.0"
```

### Testing Infrastructure

- **110+ Test Scenarios**: Comprehensive seed testing across API patterns
- **Multiple Configurations**: Different package layouts, auth schemes, type patterns
- **Docker Integration**: Consistent testing environment
- **Generated Code Validation**: Real API integration testing
- **Snapshot Testing**: When modifying generated code, always run relevant seed tests to update snapshots

### Running Seed Tests

Seed tests validate that generated code compiles and behaves correctly across different scenarios.

#### Basic Seed Test Commands
```bash
# Run all tests for a specific generator
pnpm seed test --generator <generator-name>

# Run tests for a specific fixture
pnpm seed test --generator <generator-name> --fixture <fixture-name>

# Skip post-generation scripts (faster)
pnpm seed test --generator <generator-name> --fixture <fixture-name> --skip-scripts

# Examples:
pnpm seed test --generator java-sdk --fixture exhaustive
pnpm seed test --generator java-sdk --fixture server-sent-events --skip-scripts
pnpm seed test --generator python-sdk --fixture basic-auth
```

#### Java-Specific Testing Notes
- **Java Version Compatibility**: Ensure generated code is compatible with Java 8+ (avoid Java 16+ methods like `.toList()`)
- **Common Java Fixtures**: 
  - `exhaustive` - Tests all API patterns
  - `server-sent-events` - Tests SSE/streaming functionality
  - `pagination` - Tests pagination patterns
  - `unions` - Tests discriminated and undiscriminated unions
- **Compilation Validation**: Tests ensure generated code compiles with Gradle/Maven
- **Type Safety**: Validates builder patterns, optional handling, and error types

#### Debugging Test Failures
```bash
# View detailed output
pnpm seed test --generator java-sdk --fixture <fixture> --log-level debug

# Test locally generated code
cd seed/java-sdk/<fixture>
./gradlew test
```

#### Updating Snapshots
When you modify generator code that changes the output:
1. Run the affected seed tests: `pnpm seed test --generator <generator> --fixture <fixture>`
2. Review the generated code changes in `seed/<generator>/<fixture>/`
3. If the changes are correct, the snapshots are automatically updated
4. Commit both the generator changes and updated snapshots together
5. **Important**: Always verify generated code compiles and behaves correctly before committing

## Development Workflow

### Key Commands
```bash
# Build Fern CLI
pnpm fern:build

# Run local development CLI
pnpm fern:local

# Run tests (excluding end-to-end)
pnpm test

# Run Java generator tests
pnpm --filter @fern-api/seed-cli dist:cli
```

### Testing & Validation

#### Code Quality Checks
Run these commands after making code changes:

**TypeScript/JavaScript (including java-v2):**
```bash
# Format and lint
pnpm format:fix
pnpm lint:eslint:fix

# Check without fixing
pnpm format:check
pnpm lint:eslint
```

**Java Code (legacy generator):**
```bash
cd generators/java
./gradlew spotlessApply  # Format code
./gradlew check          # Run all checks
```

#### Snapshot Test Updates
When modifying generator code that affects output:

1. **Run affected seed tests** to regenerate snapshots:
   ```bash
   pnpm seed test --generator <generator-name> --fixture <fixture-name>
   ```

2. **Review generated changes** carefully - ensure they match your intended modifications

3. **Update all affected snapshots** if changes span multiple fixtures:
   ```bash
   pnpm seed test --generator <generator-name>
   ```

4. **Update ALL Test Snapshots** when modifying test definitions:
   
   When you modify a test definition YAML file (e.g., `test-definitions/fern/apis/content-type/definition/service.yml`), 
   you MUST update ALL related snapshots:

   ```bash
   # Step 1: Update the seed test for your generator (e.g., Java Spring)
   pnpm seed test --generator <generator-name> --fixture <fixture-name> --skip-scripts
   
   # Step 2: Update Dynamic IR snapshots
   cd packages/cli/generation/ir-generator-tests
   pnpm vitest run src/dynamic-snippets/__test__/DynamicSnippetsConverter.test.ts -u
   
   # Step 3: Update IR test snapshots
   pnpm vitest run src/ir/__test__/generateIntermediateRepresentation.test.ts -u
   
   # Step 4: Update OpenAPI seed if the fixture has OpenAPI generation
   cd ../../../  # Back to root
   pnpm seed test --generator openapi --fixture <fixture-name> --skip-scripts
   
   # Step 5: Update Postman collection if the fixture has Postman generation
   pnpm seed test --generator postman --fixture <fixture-name> --skip-scripts
   
   # IMPORTANT: Git will show changes in multiple locations:
   # - seed/<generator>/<fixture>/
   # - seed/openapi/<fixture>/openapi.yml
   # - seed/postman/<fixture>/collection.json
   # - packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions/<fixture>.json
   # - packages/cli/generation/ir-generator-tests/src/ir/__test__/test-definitions/<fixture>.json
   ```

5. **Commit ALL snapshot updates** along with your generator changes to maintain test integrity

#### Updating Vitest Snapshots
**IMPORTANT: Always build the CLI before updating snapshots to avoid accidental deletions:**
```bash
# Build the CLI first
pnpm fern:build

# Then update snapshots
pnpm test -u
# Or for specific tests:
pnpm vitest run path/to/test.ts -u
```

**Why this matters:** Running `vitest -u` without the CLI built will cause Vitest to delete snapshots for tests that can't run (because they depend on the CLI). Vitest interprets test failures as "these tests don't exist anymore" and removes their snapshots. This can result in hundreds of deleted snapshot files.

#### Testing with External APIs
```bash
# Run generator on specific fixture
pnpm seed run --generator <generator-name> --fixture <fixture-name>

# Examples:
pnpm seed run --generator java-sdk --fixture exhaustive
pnpm seed run --generator java-v2-sdk --fixture unions --log-level debug

# For external APIs: manually provide API definition
# Place in test-definitions/fern/apis/<your-api>/
# Then: pnpm seed run --generator java-sdk --fixture <your-api>
```

### Generator Development
- **Base Classes**: Extend AbstractGeneratorCli for new generators
- **IR Processing**: Use @fern-fern/ir-sdk for intermediate representation
- **Docker Packaging**: Each generator has Dockerfile for containerization
- **Version Management**: Independent versioning per generator

## Key Files and Locations

### Java Generator Entry Points
- `generators/java/model/src/main/java/com/fern/java/model/Cli.java`
- `generators/java/sdk/src/main/java/com/fern/java/client/Cli.java`
- `generators/java/spring/src/main/java/com/fern/java/spring/Cli.java`
- `generators/java-v2/sdk/src/cli.ts`

### Configuration Files
- `generators/java/*/versions.yml` - Generator versions
- `generators/java-v2/sdk/features.yml` - Supported features
- `seed/java-*/seed.yml` - Test configurations

### Build Files
- `generators/java/build.gradle` - Multi-module Gradle build
- `generators/java/settings.gradle` - Gradle project structure
- `package.json` - Root npm package with scripts

## Architecture Principles

1. **Language Agnostic IR**: All generators consume the same intermediate representation
2. **Docker Consistency**: Generators run in containers for reproducible builds
3. **Type Safety First**: Strong emphasis on compile-time safety and validation
4. **Enterprise Ready**: Production-grade patterns, error handling, and documentation
5. **Extensibility**: Plugin architecture for custom generators and configurations
6. **Version Compatibility**: Backward compatibility with migration paths

This knowledge base captures the essential architecture and implementation details of Fern's Java SDK generation system, one of the most mature and feature-complete generator implementations in the ecosystem.

## Adding Configuration Flags to Java Generators

When adding a new configuration flag to Java generators, follow these steps to ensure proper propagation through the system:

### Step 1: Add to Configuration Interfaces
Add your flag to BOTH base configuration interfaces with `@JsonProperty` annotations using **hyphenated names**:

**File: `generators/java/generator-utils/src/main/java/com/fern/java/ICustomConfig.java`**
```java
@Value.Default
@JsonProperty("your-new-flag-name")  // Use hyphens, not camelCase!
default Boolean yourNewFlagName() {
    return false;  // Default value
}
```

**File: `generators/java/generator-utils/src/main/java/com/fern/java/IDownloadFilesCustomConfig.java`**
```java
@Value.Default
@JsonProperty("your-new-flag-name")  // Must match ICustomConfig
default Boolean yourNewFlagName() {
    return false;
}
```

### Step 2: Add to TypeScript Schema (for java-v2 generators)
**File: `generators/java-v2/ast/src/custom-config/BaseJavaCustomConfigSchema.ts`**
```typescript
"your-new-flag-name": z.boolean().optional(),
```

### Step 3: Add to Specific Config Classes
**File: `generators/java/sdk/src/main/java/com/fern/java/client/JavaSdkCustomConfig.java`**
- Usually inherits from ICustomConfig, no additional work needed unless overriding

**File: `generators/java/sdk/src/main/java/com/fern/java/client/JavaSdkDownloadFilesCustomConfig.java`**
- Usually inherits from IDownloadFilesCustomConfig, no additional work needed unless overriding

### Step 4: Pass Configuration in CLI
**File: `generators/java/sdk/src/main/java/com/fern/java/client/Cli.java`**

In the `runInDownloadFilesModeHook` method, ensure your flag is passed:
```java
JavaSdkCustomConfig sdkCustomConfig = JavaSdkCustomConfig.builder()
    .wrappedAliases(customConfig.wrappedAliases())
    .yourNewFlagName(customConfig.yourNewFlagName())  // Add this line
    // ... other fields
    .build();
```

### Step 5: Configure Seed Tests
**File: `seed/java-sdk/seed.yml`**

Add your fixture configuration in the `fixtures:` section:
```yaml
fixtures:
  your-fixture-name:
    - customConfig:
        your-new-flag-name: true  # Use hyphenated name
      outputFolder: default
```

For fixtures that should be skipped in certain tests, add to `skipForTests`:
```yaml
skipForTests:
  - your-fixture-name
```

### Step 6: Use in Generator Code
Access the configuration in your generator:
```java
if (context.getCustomConfig().yourNewFlagName()) {
    // Your feature logic here
}
```

### Important Notes:
1. **Hyphenated Names**: Always use hyphenated names in `@JsonProperty` annotations and YAML files
2. **Both Interfaces**: Must add to BOTH `ICustomConfig` and `IDownloadFilesCustomConfig`
3. **Rebuild Required**: After changes, rebuild with `./gradlew clean :sdk:distTar`
4. **Docker Image**: For seed tests, rebuild Docker image: `docker build -f generators/java/sdk/Dockerfile -t fernapi/fern-java-sdk:latest .`
5. **Seed Configuration**: Configuration for seed tests comes from `seed.yml`, NOT from test definition's `generators.yml`

### Example: Client-Side Default Parameters
As an example, the `use-default-request-parameter-values` flag was added following these exact steps, enabling parameters with default values to become Optional types in generated Java SDKs.


#### Key Characteristics

**Endpoint Inclusion Strategy**:
- ❌ **Excludes endpoints** without successfully generated snippets
- ✅ **Uses first available example** (user-specified preferred over auto-generated)
- ✅ **Pre-generates all snippets** before reference building for performance

**Architecture Patterns**:
- **Cache-based approach**: All snippets pre-generated and cached
- **Batch formatting**: Formats all snippets together for efficiency
- **Error handling**: Throws if no examples exist (fails fast)
- **Service organization**: Standard root vs nested service pattern

**Differences from Other Generators**:
- Unlike TypeScript (includes all endpoints), C# filters based on snippet availability
- Similar to Python in filtering approach but uses pre-generation caching
- More structured than Java V2 with clear separation of concerns

### Key Findings from Generator Analysis

#### TypeScript Generator Advantages
- **Simple Sequential Processing**: No complex concurrency control or timeout handling
- **Straightforward Endpoint Processing**: Loops through endpoints without complex IR filtering
- **Automatic Fallback**: Seamlessly falls back to auto-generated examples when user examples are missing
- **No Performance Issues**: Processes all endpoints without hanging or timing out

#### Python Generator Advantages  
- **External CLI Integration**: Uses `@fern-api/generator-cli` for markdown generation
- **Direct Endpoint Mapping**: Maps snippets by `endpoint.id` without conflicts
- **Streamlined Architecture**: Filters endpoints at reference building stage, not during snippet generation
- **Robust Error Handling**: Gracefully handles missing snippets and metadata

#### C# Generator Advantages
- **Pre-generation Caching**: Generates all snippets upfront for predictable performance
- **Batch Formatting**: Formats all snippets together for efficiency
- **Clear Architecture**: Well-separated concerns between snippet generation and reference building
- **Type Safety**: Leverages TypeScript's type system throughout the generation process

#### Java V2 Generator (Current Implementation)
The Java V2 generator implements reference.md generation with a cache-based approach:

**Location**: `generators/java-v2/sdk/`

**Key Files**:
- `SdkGeneratorCli.ts` - Main generator with reference integration
- `reference/buildReference.ts` - Reference configuration builder
- `reference/EndpointSnippetsGenerator.ts` - Snippet generation and caching
- `utils/convertEndpointSnippetRequest.ts` - Type conversion utilities

**Architecture Overview**:
1. **Pre-generation Caching**: `populateSnippetsCache()` processes all endpoints upfront
2. **Dynamic IR Integration**: Uses dynamic IR examples directly for snippet generation
3. **Method Call Extraction**: Extracts clean client method calls from full Java snippets
4. **Type Cleanup**: Removes package/import pollution from type documentation
5. **External Agent**: Uses `context.generatorAgent.generateReference()` for markdown formatting

**Implementation Flow**:
```typescript
// Main generation entry point
protected async generate(context: SdkGeneratorContext): Promise<void> {
    if (context.config.output.snippetFilepath != null) {
        // Pre-populate snippets cache
        await context.snippetGenerator.populateSnippetsCache();
        
        // Generate reference.md using cached snippets
        await this.generateReference({ context });
    }
}

// Snippet caching with dynamic IR
public async populateSnippetsCache(): Promise<void> {
    const dynamicIr = this.context.ir.dynamic;
    const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
        ir: convertIr(dynamicIr),
        config: this.context.config
    });
    
    // Process all endpoints and cache snippets
    for (const [endpointId, dynamicEndpoint] of Object.entries(dynamicIr.endpoints)) {
        const allExamples = dynamicEndpoint.examples || [];
        // Generate and cache snippets for each example
        const snippets = await Promise.all(allExamples.map(async (example) => {
            const snippet = await this.generateSingleEndpointSnippetFromDynamic({
                endpoint: irEndpoint,
                example,
                dynamicSnippetsGenerator
            });
            return { snippet, isUserSpecified: false };
        }));
        
        // Store in cache
        this.snippetsCache.set(endpointId, { autogenerated: snippets, userSpecified: [] });
    }
}

// Method call extraction
private extractMethodCall(fullSnippet: string): string {
    // Extract client.method() calls from full Java class code
    const lines = fullSnippet.split("\n");
    let methodCallLines: string[] = [];
    let inMethodCall = false;
    let braceCount = 0;
    
    for (const line of lines) {
        if (line.trim().startsWith("client.")) {
            inMethodCall = true;
            methodCallLines = [];
        }
        if (inMethodCall) {
            methodCallLines.push(line);
            // Track braces to find method call end
            if (line.includes(";") && braceCount === 0) break;
        }
    }
    return methodCallLines.join("\n").trim();
}
```

**Key Features**:
- **Dynamic IR Processing**: Uses dynamic IR examples directly without conversion
- **Method Call Extraction**: Extracts clean `client.method()` calls from full Java class code
- **Type Name Cleanup**: `getSimpleTypeName()` removes package/import pollution
- **Endpoint Filtering**: Only includes endpoints with successfully generated snippets
- **Fallback Mechanism**: Uses first available snippet when exact match not found
- **Error Handling**: Graceful degradation without breaking generation process

**Advantages**:
- **Performance**: Pre-generation caching eliminates timeout issues
- **Clean Output**: Method call extraction provides clean, focused code examples
- **Type Safety**: Leverages Java AST for accurate type representations
- **External Agent Integration**: Uses shared Fern infrastructure for markdown formatting

## Java-v2 Union Types README Generation Project

### Project Context
A feature was added to generate union types documentation in the Java-v2 SDK README generation system. This enhances the developer experience by showing how to work with both discriminated and undiscriminated union types.

### Completed Work

#### 1. Basic Union Types Feature Implementation
**Files Modified**:
- `generators/java-v2/sdk/features.yml` - Added UNION_TYPES feature with advanced: true
- `generators/java-v2/sdk/src/readme/ReadmeSnippetBuilder.ts` - Added renderUnionTypesSnippet() method

**Implementation Status**: ✅ **COMPLETED**
- Added UNION_TYPES feature to features.yml with comprehensive description
- Created basic union types renderer with generic Shape/StringOrList examples
- Integrated renderer into templatedSnippetsConfig mapping
- Feature marked as advanced: true (appears in Advanced section of README)

#### 2. Generated README Section Preview
The current implementation would generate this section in README.md:

```markdown
## Union Types

The SDK supports both discriminated and undiscriminated union types to handle APIs that return different response formats.

**Discriminated unions** use a type field to distinguish between different response types and provide compile-time type safety.

**Undiscriminated unions** don't have a discriminator field and use runtime type checking to determine the response type.

[Java code examples with generic Shape.circle() and StringOrList.of() patterns]
```

### Next Phase: Real Type Introspection

#### Problem with Current Implementation
The current implementation uses **generic hardcoded examples** (Shape, StringOrList) rather than extracting real union types from the user's API definition. This provides less value to developers who want to see examples using their actual types.

#### Proposed Solution Architecture
**Goal**: Extract real union types from the IR and generate examples based on actual user-defined types.

**Example**: For `UnionWithOddKeys` with `abbott: Foo` and `CostEllo: Bar`, generate:
```java
// Discriminated union with visitor pattern  
UnionWithOddKeys union = UnionWithOddKeys.abbott(new Foo(...));

// Type checking
if (union.isAbbott()) {
    Foo foo = union.getAbbott().get();
}

// Visitor pattern
String result = union.visit(new UnionWithOddKeys.Visitor<String>() {
    @Override
    public String visitAbbott(Foo foo) {
        return "Processing Foo: " + foo;
    }

    @Override  
    public String visitCostEllo(Bar bar) {
        return "Processing Bar: " + bar;
    }
    
    @Override
    public String _visitUnknown(Object unknownType) {
        return "Unknown type";
    }
});
```

### Implementation Plan

#### 1. IR Type Introspection System
**Files to Create/Modify**:
- `generators/java-v2/sdk/src/SdkGeneratorContext.ts` - Add helper methods
- `generators/java-v2/sdk/src/readme/ReadmeSnippetBuilder.ts` - Enhance with real type detection

**Required Methods**:
```typescript
// In SdkGeneratorContext.ts
getJavaClassReferenceFromDeclaration({ typeDeclaration }): java.ClassReference
getJavaClassReferenceFromTypeId(typeId: TypeId): java.ClassReference | undefined
resolveTypeReferenceToJavaType(typeReference: TypeReference): java.ClassReference | string | undefined

// In ReadmeSnippetBuilder.ts  
findDiscriminatedUnionTypeSnippetInfo(): DiscriminatedUnionTypeSnippetInfo | undefined
findUndiscriminatedUnionTypeSnippetInfo(): UndiscriminatedUnionTypeSnippetInfo | undefined
```

**Type Information Structures**:
```typescript
type DiscriminatedUnionTypeSnippetInfo = {
    unionType: java.ClassReference;
    subType1KeyCamelCase: string;     // "abbott"
    subType1KeyPascalCase: string;    // "Abbott"  
    subType1: java.ClassReference | string;  // Foo class reference
    subType2KeyCamelCase: string;     // "costEllo"
    subType2KeyPascalCase: string;    // "CostEllo"
    subType2: java.ClassReference | string;  // Bar class reference
}

type UndiscriminatedUnionTypeSnippetInfo = {
    unionType: java.ClassReference;
    subType1: java.ClassReference | string;
    subType2: java.ClassReference | string;
}
```

#### 2. Enhanced Renderer Logic
**Approach**:
1. **Constructor Enhancement**: Find sample union types during ReadmeSnippetBuilder initialization
2. **Conditional Rendering**: Only show union types section if real union types exist in IR
3. **Dynamic Examples**: Generate examples using actual type names and method calls

**Updated features.yml Structure**:
```yaml
- id: DISCRIMINATED_UNION_TYPES
  advanced: true
  description: |
    Discriminated unions use a type field to distinguish between different response types...

- id: UNDISCRIMINATED_UNION_TYPES  
  advanced: true
  description: |
    Undiscriminated unions use runtime type checking to determine the response type...
```

#### 3. IR Walking Logic
**Implementation Pattern**:
```typescript
private findDiscriminatedUnionTypeSnippetInfo(): DiscriminatedUnionTypeSnippetInfo | undefined {
    for (const typeDeclaration of Object.values(this.context.ir.types)) {
        const unionTypeInfo = Type._visit(typeDeclaration.shape, {
            union: (unionTypeDeclaration) => {
                if (unionTypeDeclaration.types.length >= 2) {
                    // Extract real union information
                    return {
                        unionType: this.context.getJavaClassReferenceFromDeclaration({ typeDeclaration }),
                        subType1KeyCamelCase: unionTypeDeclaration.types[0].discriminantValue.name.camelCase.safeName,
                        // ... extract all real type information
                    }
                }
                return undefined;
            },
            _other: () => undefined
        });
        if (unionTypeInfo !== undefined) {
            return unionTypeInfo;
        }
    }
    return undefined;
}
```

### Test Infrastructure Enhancement

#### 1. Union Types Test Definitions
**File to Enhance**: `test-definitions/fern/apis/unions/definition/types.yml`

**Additions Needed**:
```yaml
# Add comprehensive union type test cases
DiscriminatedShapeUnion:
  docs: Union with shape types for testing discriminated unions
  discriminated: true
  union:
    circle: Circle
    square: Square
    triangle: Triangle

UndiscriminatedValueUnion:
  docs: Union without discriminator for testing undiscriminated unions  
  union:
    stringValue: string
    numberValue: integer
    listValue: list<string>

UnionWithOddKeys:
  docs: This is a union with keys that don't match their type names.
  union:
    abbott: Foo
    CostEllo: Bar

ComplexUnion:
  docs: Union with complex nested types
  union:
    userProfile: UserProfile
    organizationData: Organization
    systemError: ApiError
```

#### 2. Seed Test Validation
**Commands to Test**:
```bash
# Test union types specifically
pnpm seed test --generator java-v2-sdk --fixture unions

# Test with union types in README generation
pnpm seed test --generator java-v2-sdk --fixture exhaustive --skip-scripts
```

### Technical Challenges

#### 1. Type Reference Resolution
**Challenge**: Converting Fern IR `TypeReference` to Java `ClassReference`
**Solution**: Implement comprehensive type resolution covering:
- Primitive types (string → String, integer → Integer)
- Named types (Custom objects)
- Container types (list<T> → List<T>)
- Generic types with parameters

#### 2. Union Type Detection
**Challenge**: Distinguishing between discriminated and undiscriminated unions
**Solution**: Use IR type system's built-in discriminated union detection:
```typescript
Type._visit(typeDeclaration.shape, {
    union: (discriminatedUnion) => { /* Handle discriminated */ },
    undiscriminatedUnion: (undiscriminatedUnion) => { /* Handle undiscriminated */ },
    _other: () => undefined
})
```

#### 3. Method Name Generation
**Challenge**: Converting union keys to proper Java method names
**Examples**:
- `abbott` → `abbott()`, `isAbbott()`, `getAbbott()`, `visitAbbott()`
- `CostEllo` → `costEllo()`, `isCostEllo()`, `getCostEllo()`, `visitCostEllo()`

### Success Criteria

#### 1. Functional Requirements
- ✅ Extract real union types from IR automatically
- ✅ Generate examples using actual user-defined type names
- ✅ Support both discriminated and undiscriminated unions
- ✅ Handle edge cases like UnionWithOddKeys
- ✅ Only show sections when relevant union types exist

#### 2. Quality Requirements  
- ✅ Generated code compiles without errors
- ✅ Examples demonstrate all key union type patterns
- ✅ Documentation is clear and actionable
- ✅ Integration tests pass for union type fixtures

#### 3. Developer Experience
- ✅ README shows realistic examples using their types
- ✅ Examples demonstrate visitor pattern correctly
- ✅ Type checking and value extraction examples work
- ✅ Advanced section placement maintains README flow

### Next Steps

1. **Implement SdkGeneratorContext helper methods** for type resolution
2. **Add IR introspection logic** to find real union types
3. **Enhance test definitions** with comprehensive union type cases
4. **Update ReadmeSnippetBuilder** with real type-based rendering
5. **Test with seed fixtures** to validate generated examples
6. **Refine based on generated README quality**

This project significantly enhances the Java SDK developer experience by providing concrete, actionable examples using their actual API types rather than generic placeholders.

## Pull Request Template

When creating pull requests, use the following template:

```markdown
## Description
<!-- Provide a clear and concise description of the changes made in this PR -->

## Changes Made
<!-- List the main changes and updates implemented in this PR -->
- 
- 
- 

## Testing
<!-- Describe how you tested these changes -->
- [ ] Unit tests added/updated
- [ ] Manual testing
```

Keep PR descriptions simple:
- Use code blocks and bullet points
- No emojis
- Be direct and concise
- Focus on what changed and why

## Java SDK Builder Extension

We've implemented a flexible builder extension system for Java SDKs based on feedback from Pipedream. The implementation uses a Template Method pattern with dynamic generation based on API specifications.

**Key Features:**
- **Dynamic Generation** - Only generates methods needed based on API spec (auth, headers, variables)
- **Template Method Pattern** - Clean structure with granular protected methods
- **Maximum Extensibility** - Every configuration aspect can be overridden
- **No Code Duplication** - Customers extend base functionality, not copy it

**Example - What Gets Generated:**
```java
// For API with auth: bearer
protected ClientOptions buildClientOptions() {
    ClientOptions.Builder builder = ClientOptions.builder();
    
    setEnvironment(builder);
    setAuthentication(builder);    // Only if API has auth
    // setCustomHeaders(builder);  // Only if API has headers
    // setVariables(builder);       // Only if API has variables
    setHttpClient(builder);
    setTimeouts(builder);
    setRetries(builder);
    setAdditional(builder);        // Always present for extensions
    
    return builder.build();
}
```

**Customer Extension Example (Pipedream's Use Case):**
```java
public class PipedreamClientBuilder extends BaseClientBuilder {
    @Override
    protected void setEnvironment(ClientOptions.Builder builder) {
        // Expand ${ENV_VAR} in URLs
        String expandedUrl = expandEnvironmentVariables(environment.getUrl());
        builder.environment(Environment.custom(expandedUrl));
    }
    
    @Override
    protected void setAuthentication(ClientOptions.Builder builder) {
        // Custom OAuth implementation
        String oauthToken = exchangeForOAuthToken(this.token);
        builder.addHeader("Authorization", "Bearer " + oauthToken);
    }
}
```

For full implementation details, see [JAVA_BUILDER_EXTENSION.md](./JAVA_BUILDER_EXTENSION.md).
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

      
      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.

