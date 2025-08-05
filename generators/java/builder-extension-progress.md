# Java SDK Builder Extension Implementation Progress

## Overview
This document tracks the implementation of the extensible builder pattern for Java SDK generation, allowing users to extend generated builders while maintaining type safety.

## Problem Statement
When users extend the generated Java SDK builders, they lose type information during method chaining. For example:
```java
class CustomApiBuilder extends ApiBuilder {
    public CustomApiBuilder customMethod() {
        return this;
    }
}

// This fails because token() returns ApiBuilder, not CustomApiBuilder
new CustomApiBuilder()
    .token("test")  // returns ApiBuilder
    .customMethod() // Error: method not found
```

## Solution: Self-Type Pattern (F-Bounded Polymorphism)
Implemented a self-type pattern with recursive generics to maintain type safety:
```java
abstract class ApiBuilder<T extends ApiBuilder<T>> {
    protected abstract T self();
    
    public T token(String token) {
        this.token = token;
        return self();
    }
}
```

## Implementation Details

### 1. Configuration Flag Added
**File:** `/generators/java/sdk/src/main/java/com/fern/java/client/JavaSdkCustomConfig.java`
```java
@JsonProperty("extend")
@Value.Default
default boolean extend() {
    return false;
}
```

### 2. Builder Generation Logic Updated
**File:** `/generators/java/sdk/src/main/java/com/fern/java/client/generators/AbstractRootClientGenerator.java`

Key changes:
- Added `isExtensible` check based on `customConfig.extend()`
- When `extend: true`:
  - Builder is `abstract` with type parameter `<T extends Builder<T>>`
  - Added abstract `self()` method
  - All setter methods return `T` instead of concrete builder
  - Added static `Impl` inner class for direct usage
- When `extend: false` (default):
  - Generates simple builder pattern (backward compatible)

### 3. Java V2 Compatibility
**File:** `/generators/java-v2/ast/src/custom-config/BaseJavaCustomConfigSchema.ts`
```typescript
"extend": z.boolean().optional(),
```

## Usage

### Configuration
```yaml
generators:
  - name: fernapi/fern-java-sdk
    config:
      extend: true  # Enable extensible builders
```

### Generated Code Example (extend: true)
```java
public abstract class ApiBuilder<T extends ApiBuilder<T>> {
    private String token;
    
    protected abstract T self();
    
    public T token(String token) {
        this.token = token;
        return self();
    }
    
    public ApiClient build() {
        return new ApiClient(buildClientOptions());
    }
    
    public static final class Impl extends ApiBuilder<Impl> {
        @Override
        protected Impl self() {
            return this;
        }
    }
}
```

### User Extension Example
```java
class CustomApiBuilder extends ApiBuilder<CustomApiBuilder> {
    private String apiKey;
    
    @Override
    protected CustomApiBuilder self() {
        return this;
    }
    
    public CustomApiBuilder apiKey(String apiKey) {
        this.apiKey = apiKey;
        return self();
    }
}

// Usage maintains type safety:
ApiClient client = new CustomApiBuilder()
    .token("test")      // returns CustomApiBuilder
    .apiKey("key123")   // returns CustomApiBuilder
    .build();
```

## Testing

### Test Fixtures
**File:** `/seed/java-sdk/seed.yml`
```yaml
builder-extension:
  - customConfig:
      client-class-name: BaseClient
    outputFolder: base-client
  - customConfig:
      client-class-name: BaseClient
      extend: true
    outputFolder: extend-true
```

### Test Verification
Created manual test to verify the pattern works:
```java
// Simple builder - works but not extensible
new SimpleBuilder().token("test").build();

// Extensible builder - using Impl
new ExtensibleBuilder.Impl().token("test").build();

// Custom builder - maintains type safety
new CustomBuilder().token("test").apiKey("key").build();
```

## Architecture Notes

### Java V1 vs V2 Generators
- Java V1 (`/generators/java/sdk/`) - Generates actual Java client code
- Java V2 (`/generators/java-v2/sdk/`) - Handles snippets, README, reference docs
- V1 invokes V2 via `JavaV2Adapter` for additional features
- The `extend` flag is implemented in V1 where client code is generated

### Key Files Modified
1. `/generators/java/sdk/src/main/java/com/fern/java/client/JavaSdkCustomConfig.java`
2. `/generators/java/sdk/src/main/java/com/fern/java/client/generators/AbstractRootClientGenerator.java`
3. `/generators/java-v2/ast/src/custom-config/BaseJavaCustomConfigSchema.ts`
4. `/test-definitions/fern/apis/java-builder-extension/generators.yml`
5. `/seed/java-sdk/seed.yml`

## Status
✅ Implementation complete
✅ Configuration flag added
✅ Builder generation logic implemented
✅ Test fixtures created
✅ Pattern verified to work correctly
⏳ Documentation updates pending

## Next Steps
1. Update user-facing documentation about the `extend` flag
2. Add examples to the Java SDK documentation
3. Consider adding this pattern to other language SDKs