# OpenAPI v3 Pipeline Testing (No CLI Compilation Required)

This directory contains improved tests for the OpenAPI v3 parser pipeline that **don't require CLI compilation**.

## 🚀 Quick Start

```bash
# Run the OpenAPI pipeline tests (no compilation needed!)
cd packages/cli/workspace/loader
pnpm test src/__test__/openapi-from-flag.test.ts

# Update snapshots when making changes
pnpm test:update src/__test__/openapi-from-flag.test.ts
```

## What This Tests

The `openapi-from-flag.test.ts` tests the **exact same functionality** as the CLI `--from-openapi` flag:

1. **OpenAPI Workspace Loading** - Loading OpenAPI specs into Fern workspace
2. **Fern Definition Generation** - Converting OpenAPI to Fern internal format
3. **Intermediate Representation (IR) Generation** - Core pipeline output
4. **Error Handling** - Graceful handling of invalid specs
5. **Regression Testing** - Snapshots prevent breaking changes

## 🔧 How It Works

### CLI Approach (Old)
```typescript
// Requires CLI compilation + Docker + full startup
await runFernCli(["fdr", outputPath, "--from-openapi"], { cwd: fixturePath });
```

### Direct Testing (New) ⭐
```typescript
// Direct function calls - no compilation needed
const workspace = await loadAPIWorkspace({ /* ... */ });
const ir = await workspace.workspace.getIntermediateRepresentation({ /* ... */ });
expect(ir).toMatchSnapshot();
```

## 📁 Test Structure

```
src/__test__/
├── openapi-from-flag.test.ts           # Main test file
├── fixtures/
│   └── openapi-from-flag-simple/      # Test OpenAPI spec
│       ├── generators.yml               # Points to OpenAPI file
│       └── openapi.yml                  # OpenAPI 3.0.3 spec
└── __snapshots__/
    └── openapi-from-flag.test.ts.snap  # IR regression snapshots
```

## 📋 How to Add New Test Cases

### 1. Create New Fixture

```bash
mkdir -p src/__test__/fixtures/my-openapi-test
```

### 2. Add OpenAPI Spec

```yaml
# src/__test__/fixtures/my-openapi-test/openapi.yml
openapi: 3.0.3
info:
  title: My Test API
  version: 1.0.0
paths:
  /test:
    get:
      operationId: getTest
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: string
```

### 3. Add Generator Config

```yaml
# src/__test__/fixtures/my-openapi-test/generators.yml
api:
  specs:
    - openapi: openapi.yml
```

### 4. Add Test Case

```typescript
// Add to openapi-from-flag.test.ts
it("should handle my specific OpenAPI case", async () => {
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: join(
            AbsoluteFilePath.of(__dirname),
            RelativeFilePath.of("fixtures/my-openapi-test")
        ),
        context: createMockTaskContext(),
        cliVersion: "0.0.0",
        workspaceName: "my-openapi-test"
    });

    expect(workspace.didSucceed).toBe(true);
    // Add specific assertions for your test case
});
```

### 5. Generate Snapshots

```bash
pnpm test:update src/__test__/openapi-from-flag.test.ts
```

## 🔍 What the Test Validates

### OpenAPI → Fern IR Pipeline
- ✅ **Schema Parsing**: OpenAPI schemas → Fern types
- ✅ **Endpoint Conversion**: OpenAPI paths → Fern services
- ✅ **Authentication**: Security schemes → Fern auth
- ✅ **Error Responses**: OpenAPI errors → Fern error types
- ✅ **Request/Response**: Bodies, parameters, headers

### Example Validations
```typescript
// Validates IR structure
expect(ir.services).toBeDefined();
expect(ir.types).toBeDefined();
expect(ir.auth).toBeDefined();

// Validates service conversion
const service = Object.values(ir.services)[0];
expect(service?.endpoints).toBeDefined();
expect(Object.keys(service?.endpoints ?? {})).toHaveLength(3);

// Snapshot regression testing
expect(JSON.stringify(ir, null, 2)).toMatchSnapshot();
```

## 🚨 When Snapshots Change

When you modify the OpenAPI processing pipeline, snapshots may change:

### 1. Review Changes Carefully
```bash
git diff src/__test__/__snapshots__/
```

### 2. Verify Changes are Expected
- Are new types/services correct?
- Are naming conventions consistent?
- Are breaking changes intentional?

### 3. Update if Valid
```bash
pnpm test:update src/__test__/openapi-from-flag.test.ts
```

### 4. Document Breaking Changes
Update changelog if IR structure changes affect generators.

## 🛠 Debugging Test Failures

### Test Fails to Load Workspace
```
❌ expect(workspace.didSucceed).toBe(true)
```
- Check `generators.yml` syntax
- Verify OpenAPI spec is valid
- Ensure file paths are correct

### IR Generation Fails
```
❌ expect(intermediateRepresentation).toBeDefined()
```
- OpenAPI spec has parsing errors
- Check console output for specific issues
- Validate OpenAPI with external tools

### Snapshot Mismatch
```
❌ Snapshot doesn't match
```
- Expected for pipeline changes
- Review diff carefully
- Update snapshot if change is correct

## 🔧 Advanced Usage

### Testing Specific OpenAPI Features

```typescript
describe("OpenAPI Auth Schemes", () => {
    it("should handle OAuth2", async () => {
        // Test OAuth2 conversion
    });

    it("should handle API Keys", async () => {
        // Test API key conversion
    });
});

describe("OpenAPI Complex Schemas", () => {
    it("should handle nested objects", async () => {
        // Test complex schema parsing
    });

    it("should handle polymorphism", async () => {
        // Test oneOf/anyOf/allOf
    });
});
```

### Custom Assertions

```typescript
// Validate specific IR properties
const healthEndpoint = service.endpoints["getHealth"];
expect(healthEndpoint?.method).toBe("GET");
expect(healthEndpoint?.path?.head).toBe("/health");

// Validate type generation
const healthResponseType = ir.types["HealthResponse"];
expect(healthResponseType?.shape).toBe("object");
```

## 📚 Related Files

- **Main Test**: `src/__test__/openapi-from-flag.test.ts`
- **Workspace Loading**: `src/loadAPIWorkspace.ts`
- **CLI Implementation**: `packages/cli/cli/src/cli.ts` (line ~851)
- **Existing OpenAPI Tests**: `src/__test__/loadWorkspace.test.ts`

This approach gives you all the benefits of comprehensive OpenAPI testing without the overhead of CLI compilation!