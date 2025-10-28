# Java v2 Generator

This file provides guidance for Claude Code when working with the Java v2 generator.

## Important Context

**Java v2 is NOT a standalone generator.** It is a supplementary component that is **always invoked by Java v1** as part of the unified Java SDK generation process. Users cannot run Java v2 independently - it exists only as a sub-module of the Java v1 generator.

## Architecture

### Relationship with Java v1

Java v2 is called by Java v1 during every SDK generation:

1. **Invocation**: Java v1 calls v2 via `JavaV2Adapter.java` which executes `node /bin/java-v2 <config-path>`
2. **Packaging**: Both v1 and v2 are packaged in a single Docker image (see `generators/java/sdk/Dockerfile`)
3. **Execution**: v2 runs after v1 completes core SDK generation
4. **Output**: v2's output (README, reference, snippets, tests) is combined with v1's SDK code

### Primary Responsibilities

Java v2 handles **documentation and testing artifacts only**:

- **README.md generation**: SDK documentation with usage examples
- **reference.md generation**: API reference documentation
- **Dynamic snippets**: Code examples for documentation (via `@fern-api/java-dynamic-snippets`)
- **Wire tests**: HTTP-level SDK validation tests

### What Java v2 Does NOT Do

Java v2 does NOT generate:
- SDK client classes (handled by v1)
- Model/POJO classes (handled by v1)
- Authentication logic (handled by v1)
- HTTP client infrastructure (handled by v1)
- Error handling classes (handled by v1)
- Gradle build configuration (handled by v1)

## Key Files and Directories

```
generators/java-v2/
├── ast/                          # Java AST utilities (TypeScript)
│   └── src/                      # AST node builders for Java syntax
├── base/                         # Base generator infrastructure
│   └── src/                      # Shared utilities with other TS generators
├── dynamic-snippets/             # Dynamic code snippet generation
│   └── src/                      # Snippet generation logic
└── sdk/                          # Main v2 generator
    ├── src/
    │   ├── cli.ts                # CLI entry point (disables notifications)
    │   ├── SdkGeneratorCli.ts    # Main generator class
    │   ├── SdkGeneratorContext.ts # Generator context and configuration
    │   ├── readme/               # README.md generation
    │   ├── reference/            # reference.md generation
    │   │   ├── buildReference.ts # Reference builder
    │   │   └── EndpointSnippetsGenerator.ts # Endpoint examples
    │   ├── sdk-wire-tests/       # Wire test generation
    │   │   ├── SdkWireTestGenerator.ts # Main test generator
    │   │   ├── builders/         # Test class builders
    │   │   ├── extractors/       # Test data extractors
    │   │   └── validators/       # Test validators
    │   └── utils/                # Utility functions
    ├── features.yml              # Feature flags for v2
    ├── package.json              # Node.js dependencies
    └── tsconfig.json             # TypeScript configuration
```

## How v2 is Invoked

### From Java v1

**Entry Point**: `generators/java/sdk/src/main/java/com/fern/java/client/Cli.java:118-121`

```java
@Override
public void runV2Generator(DefaultGeneratorExecClient defaultGeneratorExecClient, String[] args) {
    JavaV2Adapter.run(defaultGeneratorExecClient, new JavaV2Arguments(args[0]));
}
```

**Adapter**: `generators/java/generator-utils/src/main/java/com/fern/java/JavaV2Adapter.java`

The adapter:
1. Constructs command: `node /bin/java-v2 <config-path>`
2. Executes v2 as a subprocess
3. Streams stdout/stderr to v1's logging
4. Fails v1 generation if v2 exits with non-zero code

### Docker Packaging

**Dockerfile**: `generators/java/sdk/Dockerfile`

Multi-stage build:
1. **Stage 1 (Node)**: Builds v2 TypeScript code to `dist/cli.cjs`
2. **Stage 2 (Java)**: Builds v1, copies Node runtime and v2 CLI
3. **Result**: Single image with both generators, v2 at `/bin/java-v2`

## Generation Flow

```
User: fern generate
  ↓
Fern CLI invokes Java generator Docker container
  ↓
v1 starts (Java/Gradle)
  ↓
v1 generates:
  - Client classes
  - Models/POJOs
  - Authentication
  - Error handling
  - HTTP infrastructure
  ↓
v1 calls runV2Generator()
  ↓
JavaV2Adapter executes: node /bin/java-v2 <config>
  ↓
v2 starts (Node.js/TypeScript)
  ↓
v2 generates:
  - README.md
  - reference.md
  - snippets.json
  - Wire tests
  ↓
v2 exits (success or failure)
  ↓
v1 checks v2 exit code
  ↓
If v2 failed: v1 fails entire generation
If v2 succeeded: v1 completes successfully
  ↓
Combined output: SDK code + documentation + tests
```

## Key Implementation Details

### SdkGeneratorCli.ts

Main generator class that extends `AbstractJavaGeneratorCli`:

```typescript
export class SdkGeneratorCLI extends AbstractJavaGeneratorCli<SdkCustomConfigSchema, SdkGeneratorContext> {
    protected async generate(context: SdkGeneratorContext): Promise<void> {
        // Generate snippets, README, reference, wire tests
        // All generation wrapped in try-catch with warnings (non-fatal)
    }
}
```

**Important**: v2 generation failures are logged as warnings but don't fail the build (within v2). However, if v2 exits with non-zero code, v1 will fail.

### Notification Disabling

**File**: `sdk/src/cli.ts`

```typescript
await cli.run({
    // We disable notifications because the `java-v2` generator notifications
    // prevent the `java` generator from succeeding in remote code generation
    // environments.
    disableNotifications: true
});
```

This prevents v2 from sending status updates that would conflict with v1's notifications.

### Dynamic Snippets

v2 uses `@fern-api/java-dynamic-snippets` to generate code examples:

1. Receives dynamic IR from Fern CLI
2. Converts IR to snippet requests
3. Generates Java code snippets for each endpoint example
4. Outputs snippets.json for documentation

### Wire Tests

v2 generates HTTP-level tests to validate SDK behavior:

- **Validators**: JSON, pagination, header validation
- **Extractors**: Test data and snippet extraction
- **Builders**: Test class construction

## Development Commands

### Building v2

```bash
cd generators/java-v2/sdk
pnpm install
pnpm compile
```

### Testing v2 (via v1)

Since v2 cannot run standalone, test via v1:

```bash
# From repository root
pnpm seed test --generator java-sdk --fixture <fixture-name> --skip-scripts
```

### Local Development

To test v2 changes:

1. Build v2: `cd generators/java-v2/sdk && pnpm compile`
2. Build Docker image: Build the Java v1 Docker image (includes v2)
3. Run seed tests: `pnpm seed test --generator java-sdk`

## Common Issues

### v2 Not Found in Docker

**Symptom**: `Could not find v2 executable at provided path /bin/java-v2`

**Solution**: Check Dockerfile multi-stage build:
- Verify v2 is compiled in stage 1
- Verify v2 CLI is copied to `/bin/java-v2` in stage 2
- Verify `/bin/java-v2` is made executable (`chmod +x`)

### v2 Generation Failures

**Symptom**: v1 fails with "Java V2 generator exited with code X"

**Solution**: 
- Check v2 logs in v1 output (prefixed with `[Java V2 STDOUT]` or `[Java V2 STDERR]`)
- Common causes: Missing dynamic IR, TypeScript compilation errors, missing dependencies

### Missing README/reference

**Symptom**: Generated SDK lacks README.md or reference.md

**Solution**:
- Check if `config.output.snippetFilepath` is set (required for v2 generation)
- Check v2 logs for warnings about generation failures
- Verify dynamic IR is available in generator config

### Notification Conflicts

**Symptom**: Remote generation fails with notification errors

**Solution**: Ensure `disableNotifications: true` in `cli.ts` (already configured)

## Future Direction

Currently, Java v2 is tightly coupled to v1. Future work may include:

1. **True Separation**: Make v2 a standalone generator users can configure independently
2. **Feature Parity**: Move more SDK generation logic from v1 to v2
3. **Independent Versioning**: Allow v1 and v2 to version independently
4. **Optional Invocation**: Allow users to skip v2 if they don't need documentation/tests

For now, treat v1 and v2 as a single unified generator where v2 is a sub-module of v1.
