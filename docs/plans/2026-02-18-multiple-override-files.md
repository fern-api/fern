# CLI-v2 Multiple Override Files Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable CLI-v2 to support both single and multiple override files (`string | string[]`) matching CLI-v1 compatibility.

**Architecture:** Three-tier update: Zod schemas validate `string | string[]` input, converter handles path resolution for both formats, internal interfaces use union types, remove temporary workaround.

**Tech Stack:** TypeScript, Zod validation, file system operations, Jest/testing

---

## Task 1: Update Zod Schema for OpenAPI Specs

**Files:**
- Modify: `packages/cli/config/src/schemas/specs/OpenApiSpecSchema.ts:16`
- Test: `packages/cli/config/src/schemas/specs/__test__/OpenApiSpecSchema.test.ts`

**Step 1: Write failing test for array override support**

Create test file if it doesn't exist:

```typescript
import { z } from "zod";
import { OpenApiSpecSchema } from "../OpenApiSpecSchema.js";

describe("OpenApiSpecSchema", () => {
    describe("overrides", () => {
        it("should accept single override string", () => {
            const input = {
                openapi: "./api.yml",
                overrides: "./overrides.yml"
            };
            const result = OpenApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept array of override strings", () => {
            const input = {
                openapi: "./api.yml",
                overrides: ["./overrides1.yml", "./overrides2.yml"]
            };
            const result = OpenApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept undefined overrides", () => {
            const input = {
                openapi: "./api.yml"
            };
            const result = OpenApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });
    });
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/cli/config && pnpm test OpenApiSpecSchema.test.ts`
Expected: FAIL with array test failing validation

**Step 3: Update OpenApiSpecSchema to support string | string[]**

```typescript
// In OpenApiSpecSchema.ts, change line 16 from:
overrides: z.string().optional(),

// To:
overrides: z.union([z.string(), z.array(z.string())]).optional(),
```

**Step 4: Run test to verify it passes**

Run: `cd packages/cli/config && pnpm test OpenApiSpecSchema.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/cli/config/src/schemas/specs/OpenApiSpecSchema.ts packages/cli/config/src/schemas/specs/__test__/OpenApiSpecSchema.test.ts
git commit -m "feat(config): support string | string[] for OpenAPI overrides schema"
```

## Task 2: Update Zod Schema for AsyncAPI Specs

**Files:**
- Modify: `packages/cli/config/src/schemas/specs/AsyncApiSpecSchema.ts`
- Test: `packages/cli/config/src/schemas/specs/__test__/AsyncApiSpecSchema.test.ts`

**Step 1: Write failing test for array override support**

```typescript
import { z } from "zod";
import { AsyncApiSpecSchema } from "../AsyncApiSpecSchema.js";

describe("AsyncApiSpecSchema", () => {
    describe("overrides", () => {
        it("should accept single override string", () => {
            const input = {
                asyncapi: "./api.yml",
                overrides: "./overrides.yml"
            };
            const result = AsyncApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept array of override strings", () => {
            const input = {
                asyncapi: "./api.yml",
                overrides: ["./overrides1.yml", "./overrides2.yml"]
            };
            const result = AsyncApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });
    });
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/cli/config && pnpm test AsyncApiSpecSchema.test.ts`
Expected: FAIL with array test failing

**Step 3: Update AsyncApiSpecSchema**

Find the overrides line and change it to:
```typescript
overrides: z.union([z.string(), z.array(z.string())]).optional(),
```

**Step 4: Run test to verify it passes**

Run: `cd packages/cli/config && pnpm test AsyncApiSpecSchema.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/cli/config/src/schemas/specs/AsyncApiSpecSchema.ts packages/cli/config/src/schemas/specs/__test__/AsyncApiSpecSchema.test.ts
git commit -m "feat(config): support string | string[] for AsyncAPI overrides schema"
```

## Task 3: Update Zod Schema for Protobuf Specs

**Files:**
- Modify: `packages/cli/config/src/schemas/specs/ProtobufSpecSchema.ts`
- Test: `packages/cli/config/src/schemas/specs/__test__/ProtobufSpecSchema.test.ts`

**Step 1: Write failing test**

```typescript
import { ProtobufSpecSchema } from "../ProtobufSpecSchema.js";

describe("ProtobufSpecSchema", () => {
    describe("proto.overrides", () => {
        it("should accept single override string", () => {
            const input = {
                proto: {
                    root: "./proto",
                    overrides: "./overrides.yml"
                }
            };
            const result = ProtobufSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept array of override strings", () => {
            const input = {
                proto: {
                    root: "./proto",
                    overrides: ["./overrides1.yml", "./overrides2.yml"]
                }
            };
            const result = ProtobufSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });
    });
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/cli/config && pnpm test ProtobufSpecSchema.test.ts`
Expected: FAIL with array test failing

**Step 3: Update ProtobufSpecSchema**

Find the proto.overrides field and update it:
```typescript
overrides: z.union([z.string(), z.array(z.string())]).optional(),
```

**Step 4: Run test to verify it passes**

Run: `cd packages/cli/config && pnpm test ProtobufSpecSchema.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/cli/config/src/schemas/specs/ProtobufSpecSchema.ts packages/cli/config/src/schemas/specs/__test__/ProtobufSpecSchema.test.ts
git commit -m "feat(config): support string | string[] for Protobuf overrides schema"
```

## Task 4: Update Zod Schema for OpenRPC Specs

**Files:**
- Modify: `packages/cli/config/src/schemas/specs/OpenRpcSpecSchema.ts`
- Test: `packages/cli/config/src/schemas/specs/__test__/OpenRpcSpecSchema.test.ts`

**Step 1: Write failing test**

```typescript
import { OpenRpcSpecSchema } from "../OpenRpcSpecSchema.js";

describe("OpenRpcSpecSchema", () => {
    describe("overrides", () => {
        it("should accept single override string", () => {
            const input = {
                openrpc: "./api.json",
                overrides: "./overrides.yml"
            };
            const result = OpenRpcSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept array of override strings", () => {
            const input = {
                openrpc: "./api.json",
                overrides: ["./overrides1.yml", "./overrides2.yml"]
            };
            const result = OpenRpcSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });
    });
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/cli/config && pnpm test OpenRpcSpecSchema.test.ts`
Expected: FAIL with array test failing

**Step 3: Update OpenRpcSpecSchema**

```typescript
overrides: z.union([z.string(), z.array(z.string())]).optional(),
```

**Step 4: Run test to verify it passes**

Run: `cd packages/cli/config && pnpm test OpenRpcSpecSchema.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/cli/config/src/schemas/specs/OpenRpcSpecSchema.ts packages/cli/config/src/schemas/specs/__test__/OpenRpcSpecSchema.test.ts
git commit -m "feat(config): support string | string[] for OpenRPC overrides schema"
```

## Task 5: Update CLI-v2 OpenApiSpec Interface

**Files:**
- Modify: `packages/cli/cli-v2/src/api/config/OpenApiSpec.ts:16`

**Step 1: Update interface type**

Change line 16 from:
```typescript
overrides?: AbsoluteFilePath;
```

To:
```typescript
overrides?: AbsoluteFilePath | AbsoluteFilePath[];
```

**Step 2: Add type guard utility**

Add at the end of the file:
```typescript
/**
 * Type guard to check if overrides is an array of files.
 */
export function isMultipleOverrides(overrides: AbsoluteFilePath | AbsoluteFilePath[]): overrides is AbsoluteFilePath[] {
    return Array.isArray(overrides);
}
```

**Step 3: Commit**

```bash
git add packages/cli/cli-v2/src/api/config/OpenApiSpec.ts
git commit -m "feat(cli-v2): support multiple override files in OpenApiSpec interface"
```

## Task 6: Update CLI-v2 AsyncApiSpec Interface

**Files:**
- Modify: `packages/cli/cli-v2/src/api/config/AsyncApiSpec.ts`

**Step 1: Update interface type**

Change the overrides field to:
```typescript
overrides?: AbsoluteFilePath | AbsoluteFilePath[];
```

**Step 2: Add type guard utility**

```typescript
/**
 * Type guard to check if overrides is an array of files.
 */
export function isMultipleOverrides(overrides: AbsoluteFilePath | AbsoluteFilePath[]): overrides is AbsoluteFilePath[] {
    return Array.isArray(overrides);
}
```

**Step 3: Commit**

```bash
git add packages/cli/cli-v2/src/api/config/AsyncApiSpec.ts
git commit -m "feat(cli-v2): support multiple override files in AsyncApiSpec interface"
```

## Task 7: Update CLI-v2 ProtobufSpec Interface

**Files:**
- Modify: `packages/cli/cli-v2/src/api/config/ProtobufSpec.ts`

**Step 1: Update interface type**

Change the overrides field in ProtobufDefinition to:
```typescript
overrides?: AbsoluteFilePath | AbsoluteFilePath[];
```

**Step 2: Add type guard utility**

```typescript
/**
 * Type guard for ProtobufDefinition overrides.
 */
export function isMultipleProtobufOverrides(overrides: AbsoluteFilePath | AbsoluteFilePath[]): overrides is AbsoluteFilePath[] {
    return Array.isArray(overrides);
}
```

**Step 3: Commit**

```bash
git add packages/cli/cli-v2/src/api/config/ProtobufSpec.ts
git commit -m "feat(cli-v2): support multiple override files in ProtobufSpec interface"
```

## Task 8: Update CLI-v2 OpenRpcSpec Interface

**Files:**
- Modify: `packages/cli/cli-v2/src/api/config/OpenRpcSpec.ts`

**Step 1: Update interface type**

Change the overrides field to:
```typescript
overrides?: AbsoluteFilePath | AbsoluteFilePath[];
```

**Step 2: Add type guard utility**

```typescript
/**
 * Type guard to check if overrides is an array of files.
 */
export function isMultipleOverrides(overrides: AbsoluteFilePath | AbsoluteFilePath[]): overrides is AbsoluteFilePath[] {
    return Array.isArray(overrides);
}
```

**Step 3: Commit**

```bash
git add packages/cli/cli-v2/src/api/config/OpenRpcSpec.ts
git commit -m "feat(cli-v2): support multiple override files in OpenRpcSpec interface"
```

## Task 9: Update ApiDefinitionConverter for OpenApi

**Files:**
- Modify: `packages/cli/cli-v2/src/api/config/converter/ApiDefinitionConverter.ts`
- Test: `packages/cli/cli-v2/src/__test__/ApiDefinitionConverter.test.ts`

**Step 1: Write failing test**

Add test case to existing test file:
```typescript
it("should handle multiple override files for OpenAPI spec", async () => {
    const fernYml = createMockFernYml({
        api: {
            openapi: "./openapi.yml",
            overrides: ["./override1.yml", "./override2.yml"]
        }
    });

    const result = await converter.convert({ fernYml });
    expect(result.success).toBe(true);
    if (result.success) {
        const openApiSpec = result.apis.api?.specs.find(spec => "openapi" in spec);
        expect(openApiSpec?.overrides).toEqual([
            AbsoluteFilePath.of("/test/override1.yml"),
            AbsoluteFilePath.of("/test/override2.yml")
        ]);
    }
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/cli/cli-v2 && pnpm test ApiDefinitionConverter.test.ts`
Expected: FAIL with type error

**Step 3: Update convertOpenApiSpec method**

Replace the overrides handling in `convertOpenApiSpec`:
```typescript
if (spec.overrides != null && !isNullish(sourced.overrides)) {
    if (Array.isArray(spec.overrides)) {
        // Handle array case
        const resolvedOverrides: AbsoluteFilePath[] = [];
        for (let i = 0; i < spec.overrides.length; i++) {
            const override = spec.overrides[i];
            const sourcedOverride = Array.isArray(sourced.overrides) ? sourced.overrides[i] : sourced.overrides;
            if (override != null && !isNullish(sourcedOverride)) {
                resolvedOverrides.push(await this.resolvePath({
                    absoluteFernYmlPath,
                    path: override,
                    sourced: sourcedOverride
                }));
            }
        }
        result.overrides = resolvedOverrides;
    } else {
        // Handle single string case (existing logic)
        result.overrides = await this.resolvePath({
            absoluteFernYmlPath,
            path: spec.overrides,
            sourced: sourced.overrides
        });
    }
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/cli/cli-v2 && pnpm test ApiDefinitionConverter.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/cli/cli-v2/src/api/config/converter/ApiDefinitionConverter.ts packages/cli/cli-v2/src/__test__/ApiDefinitionConverter.test.ts
git commit -m "feat(cli-v2): handle multiple overrides in OpenAPI converter"
```

## Task 10: Update ApiDefinitionConverter for AsyncApi

**Files:**
- Modify: `packages/cli/cli-v2/src/api/config/converter/ApiDefinitionConverter.ts`
- Test: `packages/cli/cli-v2/src/__test__/ApiDefinitionConverter.test.ts`

**Step 1: Write failing test**

```typescript
it("should handle multiple override files for AsyncAPI spec", async () => {
    const fernYml = createMockFernYml({
        api: {
            asyncapi: "./asyncapi.yml",
            overrides: ["./override1.yml", "./override2.yml"]
        }
    });

    const result = await converter.convert({ fernYml });
    expect(result.success).toBe(true);
    if (result.success) {
        const asyncApiSpec = result.apis.api?.specs.find(spec => "asyncapi" in spec);
        expect(asyncApiSpec?.overrides).toEqual([
            AbsoluteFilePath.of("/test/override1.yml"),
            AbsoluteFilePath.of("/test/override2.yml")
        ]);
    }
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/cli/cli-v2 && pnpm test ApiDefinitionConverter.test.ts`
Expected: FAIL

**Step 3: Update convertAsyncApiSpec method**

Replace the overrides handling in `convertAsyncApiSpec` with same logic as Task 9.

**Step 4: Run test to verify it passes**

Run: `cd packages/cli/cli-v2 && pnpm test ApiDefinitionConverter.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/cli/cli-v2/src/api/config/converter/ApiDefinitionConverter.ts packages/cli/cli-v2/src/__test__/ApiDefinitionConverter.test.ts
git commit -m "feat(cli-v2): handle multiple overrides in AsyncAPI converter"
```

## Task 11: Update ApiDefinitionConverter for Protobuf

**Files:**
- Modify: `packages/cli/cli-v2/src/api/config/converter/ApiDefinitionConverter.ts`
- Test: `packages/cli/cli-v2/src/__test__/ApiDefinitionConverter.test.ts`

**Step 1: Write failing test**

```typescript
it("should handle multiple override files for Protobuf spec", async () => {
    const fernYml = createMockFernYml({
        api: {
            proto: {
                root: "./proto",
                overrides: ["./override1.yml", "./override2.yml"]
            }
        }
    });

    const result = await converter.convert({ fernYml });
    expect(result.success).toBe(true);
    if (result.success) {
        const protobufSpec = result.apis.api?.specs.find(spec => "proto" in spec);
        expect(protobufSpec?.proto.overrides).toEqual([
            AbsoluteFilePath.of("/test/override1.yml"),
            AbsoluteFilePath.of("/test/override2.yml")
        ]);
    }
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/cli/cli-v2 && pnpm test ApiDefinitionConverter.test.ts`
Expected: FAIL

**Step 3: Update convertProtobufSpec method**

Replace the proto.overrides handling in `convertProtobufSpec` with array handling logic.

**Step 4: Run test to verify it passes**

Run: `cd packages/cli/cli-v2 && pnpm test ApiDefinitionConverter.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/cli/cli-v2/src/api/config/converter/ApiDefinitionConverter.ts packages/cli/cli-v2/src/__test__/ApiDefinitionConverter.test.ts
git commit -m "feat(cli-v2): handle multiple overrides in Protobuf converter"
```

## Task 12: Update ApiDefinitionConverter for OpenRpc

**Files:**
- Modify: `packages/cli/cli-v2/src/api/config/converter/ApiDefinitionConverter.ts`
- Test: `packages/cli/cli-v2/src/__test__/ApiDefinitionConverter.test.ts`

**Step 1: Write failing test**

```typescript
it("should handle multiple override files for OpenRPC spec", async () => {
    const fernYml = createMockFernYml({
        api: {
            openrpc: "./openrpc.json",
            overrides: ["./override1.yml", "./override2.yml"]
        }
    });

    const result = await converter.convert({ fernYml });
    expect(result.success).toBe(true);
    if (result.success) {
        const openRpcSpec = result.apis.api?.specs.find(spec => "openrpc" in spec);
        expect(openRpcSpec?.overrides).toEqual([
            AbsoluteFilePath.of("/test/override1.yml"),
            AbsoluteFilePath.of("/test/override2.yml")
        ]);
    }
});
```

**Step 2: Run test to verify it fails**

Run: `cd packages/cli/cli-v2 && pnpm test ApiDefinitionConverter.test.ts`
Expected: FAIL

**Step 3: Update convertOpenRpcSpec method**

Replace the overrides handling in `convertOpenRpcSpec` with array handling logic.

**Step 4: Run test to verify it passes**

Run: `cd packages/cli/cli-v2 && pnpm test ApiDefinitionConverter.test.ts`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add packages/cli/cli-v2/src/api/config/converter/ApiDefinitionConverter.ts packages/cli/cli-v2/src/__test__/ApiDefinitionConverter.test.ts
git commit -m "feat(cli-v2): handle multiple overrides in OpenRPC converter"
```

## Task 13: Remove Temporary Workaround

**Files:**
- Modify: `packages/cli/cli-v2/src/migrator/converters/convertApiSpecs.ts`

**Step 1: Remove convertOverridesToString function**

Delete lines 12-21:
```typescript
// Remove this entire function:
function convertOverridesToString(overrides: generatorsYml.OverridesSchema | undefined): string | undefined {
    if (overrides == null) {
        return undefined;
    }
    if (Array.isArray(overrides)) {
        return overrides[0];
    }
    return overrides;
}
```

**Step 2: Remove calls to convertOverridesToString**

Replace all occurrences of:
```typescript
result.overrides = convertOverridesToString(spec.overrides);
```

With:
```typescript
result.overrides = spec.overrides;
```

Find and replace in lines: 293, 316, 344, 367, 424, 444, 464, 500

**Step 3: Compile to check for TypeScript errors**

Run: `cd packages/cli/cli-v2 && pnpm compile`
Expected: Clean compilation

**Step 4: Commit**

```bash
git add packages/cli/cli-v2/src/migrator/converters/convertApiSpecs.ts
git commit -m "feat(cli-v2): remove convertOverridesToString workaround

CLI-v2 now natively supports multiple override files, no need for conversion"
```

## Task 14: Integration Testing

**Files:**
- Test: `packages/cli/cli-v2/src/__test__/integration.test.ts`

**Step 1: Write integration test**

Add comprehensive test:
```typescript
describe("Multiple Override Files Integration", () => {
    it("should handle workspace with multiple override files", async () => {
        const tempDir = await createTempDirectory();

        // Create test files
        await writeFile(join(tempDir, "fern.yml"), `
api:
  openapi: ./openapi.yml
  overrides:
    - ./override1.yml
    - ./override2.yml
`);
        await writeFile(join(tempDir, "openapi.yml"), "openapi: 3.0.0\ninfo:\n  title: Test");
        await writeFile(join(tempDir, "override1.yml"), "# Override 1");
        await writeFile(join(tempDir, "override2.yml"), "# Override 2");

        const loader = new WorkspaceLoader({ cwd: tempDir, logger: mockLogger });
        const fernYml = await new FernYmlSchemaLoader({ cwd: tempDir }).loadOrThrow();
        const result = await loader.load({ fernYml });

        expect(result.success).toBe(true);
        if (result.success) {
            const apiDef = result.workspace.apis.api;
            const openApiSpec = apiDef?.specs.find(spec => "openapi" in spec);
            expect(Array.isArray(openApiSpec?.overrides)).toBe(true);
            expect(openApiSpec?.overrides).toHaveLength(2);
        }
    });
});
```

**Step 2: Run integration test**

Run: `cd packages/cli/cli-v2 && pnpm test integration.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/cli/cli-v2/src/__test__/integration.test.ts
git commit -m "test(cli-v2): add integration test for multiple override files"
```

## Task 15: Final Compilation and Testing

**Step 1: Full compilation check**

Run: `cd /Users/jsklan/git/fern-3 && pnpm compile`
Expected: Clean compilation across all packages

**Step 2: Run full test suite**

Run: `cd /Users/jsklan/git/fern-3 && pnpm test`
Expected: All tests PASS

**Step 3: Run CLI-v2 specific tests**

Run: `cd /Users/jsklan/git/fern-3 && pnpm test --filter "*cli-v2*"`
Expected: All CLI-v2 tests PASS

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(cli-v2): complete multiple override files support

- Support string | string[] in all spec schemas (Zod validation)
- Update converter to handle both single and array inputs
- Update internal interfaces with union types
- Remove temporary convertOverridesToString workaround
- Add comprehensive test coverage

Resolves CLI-v1/v2 compatibility for override files"
```

---

**Testing Notes:**
- Each override file is validated for existence during conversion
- Multiple files are processed in array order
- Backward compatibility maintained (single strings still work)
- Error messages include source location mapping for debugging