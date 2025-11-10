# OpenAPI v3 Pipeline Testing

Direct testing of OpenAPI v3 parser pipeline without CLI compilation.

## Quick Start

```bash
# Run tests
cd packages/cli/workspace/register
pnpm test src/ir-to-fdr-converter/__test__/openapi-from-flag.test.ts

# Update snapshots
pnpm test:update src/ir-to-fdr-converter/__test__/openapi-from-flag.test.ts
```

## What This Tests

Tests the complete `fern fdr {file} --from-openapi` pipeline:

1. **OpenAPI Workspace Loading** - Load OpenAPI specs into Fern workspace
2. **v3 Parser Route** - Uses `OpenAPI3_1Converter` (actual v3 parser)
3. **IR Generation** - Creates Intermediate Representation
4. **FDR Conversion** - Converts IR to S3-ready format via `convertIrToFdrApi`
5. **Regression Testing** - Snapshots prevent breaking changes

**Output matches exactly what gets uploaded to S3.**

## OpenAPI v3 Parser Pipeline

```
OpenAPI spec → OSSWorkspace → OpenAPI3_1Converter → IR → convertIrToFdrApi → FDR (S3 format)
```

This is the same path as `--from-openapi` flag.

## How to Add New Tests

**Keep tests simple!** Focus on one specific aspect per test.

### 1. Create Fixture

```bash
mkdir -p src/__test__/fixtures/my-test-name
```

### 2. Add OpenAPI Spec

```yaml
# src/__test__/fixtures/my-test-name/openapi.yml
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
# src/__test__/fixtures/my-test-name/generators.yml
api:
  specs:
    - openapi: openapi.yml
```

### 4. Add Test Case

```typescript
// Add to openapi-from-flag.test.ts
it("should handle my specific case", async () => {
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: join(
            AbsoluteFilePath.of(__dirname),
            RelativeFilePath.of("fixtures/my-test-name")
        ),
        context,
        cliVersion: "0.0.0",
        workspaceName: "my-test-name"
    });

    expect(workspace.didSucceed).toBe(true);
    assert(workspace.didSucceed);

    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace`);
    }

    const ir = await workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: true,
        generateV1Examples: false
    });

    const fdrApiDefinition = await convertIrToFdrApi({
        ir,
        snippetsConfig: { /* all undefined */ },
        playgroundConfig: { oauth: true },
        context
    });

    // Add specific validations for your test case
    expect(ir.services).toBeDefined();
    expect(fdrApiDefinition.types).toBeDefined();

    // Snapshot for regression testing
    const fdrSnapshot = JSON.stringify(fdrApiDefinition, null, 2);
    expect(fdrSnapshot).toMatchSnapshot("my-test-name-fdr.json");
});
```

### 5. Generate Snapshots

```bash
pnpm test:update src/__test__/openapi-from-flag.test.ts
```

## Test Guidelines

- **Keep OpenAPI specs simple** - Focus on the specific feature being tested
- **One concern per test** - Don't mix auth + complex schemas + multiple endpoints
- **Use descriptive names** - Test name should explain what's being validated
- **Always snapshot FDR output** - This is the S3-ready format
- **Validate key structures** - Check that expected IR/FDR properties exist

## Example Tests

- **Basic Pipeline** - Simple endpoints with basic schemas
- **Auth Schemes** - Bearer token authentication
- **Error Handling** - Invalid workspace loading

## Files

- **Test**: `src/__test__/openapi-from-flag.test.ts`
- **Fixtures**: `src/__test__/fixtures/*/`
- **Snapshots**: `src/__test__/__snapshots__/openapi-from-flag.test.ts.snap`