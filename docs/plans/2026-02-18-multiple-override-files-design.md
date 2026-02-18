# CLI-v2 Multiple Override Files Support

**Date**: 2026-02-18
**Status**: Approved for Implementation
**Related Commit**: eaa79c4 (temporary workaround to be removed)

## Problem

Currently, CLI-v2 only supports single override files while CLI-v1 supports both single strings and arrays of strings (`OverridesSchema = string | string[]`). The current workaround in commit eaa79c4 converts arrays to single strings by taking the first element, losing the ability to use multiple override files.

## Goal

Make CLI-v2 schema compatible with CLI-v1 by supporting `string | string[]` for override file paths across the three-tier architecture.

## Architecture Context

CLI-v2 uses a three-tier architecture for configuration processing:

1. **Zod Schema** (input validation) - validates user input format
2. **Converter** (data processing) - resolves paths, validates file existence, transforms data
3. **Internal Interface** (runtime representation) - strongly-typed interfaces for internal use

This architecture exists because the converter performs meaningful work beyond type conversion:
- Resolves relative paths to absolute paths based on fern.yml location
- Validates that files exist on disk
- Provides source location mapping for error reporting
- Converts string paths to strongly-typed `AbsoluteFilePath` objects

## Design

### 1. Schema Layer Changes

**Files to modify**:
- `/packages/cli/config/src/schemas/specs/OpenApiSpecSchema.ts:16`
- `/packages/cli/config/src/schemas/specs/AsyncApiSpecSchema.ts`
- `/packages/cli/config/src/schemas/specs/ProtobufSpecSchema.ts`
- `/packages/cli/config/src/schemas/specs/OpenRpcSpecSchema.ts`

**Change**:
```typescript
// Before
overrides: z.string().optional()

// After
overrides: z.union([z.string(), z.array(z.string())]).optional()
```

**Impact**: Allows users to specify either single or multiple override files:
```yaml
# Single file (backward compatible)
overrides: "./overrides.yml"

# Multiple files (new feature)
overrides:
  - "./overrides1.yml"
  - "./overrides2.yml"
```

### 2. Converter Layer Changes

**Files to modify**: `/packages/cli/cli-v2/src/api/config/converter/ApiDefinitionConverter.ts`
- `convertOpenApiSpec()`
- `convertAsyncApiSpec()`
- `convertProtobufSpec()`
- `convertOpenRpcSpec()`

**Logic**: Update each convert method to handle both string and array inputs:

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

**Impact**: Each override file path gets resolved to an absolute path and validated for existence.

### 3. Internal Interface Changes

**Files to modify**:
- `/packages/cli/cli-v2/src/api/config/OpenApiSpec.ts:16`
- `/packages/cli/cli-v2/src/api/config/AsyncApiSpec.ts:16`
- `/packages/cli/cli-v2/src/api/config/ProtobufSpec.ts:16`
- `/packages/cli/cli-v2/src/api/config/OpenRpcSpec.ts:16`

**Change**:
```typescript
// Before
overrides?: AbsoluteFilePath

// After
overrides?: AbsoluteFilePath | AbsoluteFilePath[]
```

**Impact**: Downstream code that processes overrides will need to handle both single file and array cases.

**Utility Functions**: Consider adding type guards for convenience:
```typescript
export function isMultipleOverrides(overrides: AbsoluteFilePath | AbsoluteFilePath[]): overrides is AbsoluteFilePath[] {
    return Array.isArray(overrides);
}
```

### 4. Cleanup - Remove Temporary Workaround

**File to modify**: `/packages/cli/cli-v2/src/migrator/converters/convertApiSpecs.ts`

**Remove**:
- `convertOverridesToString()` function (lines 12-21)
- All calls to `convertOverridesToString()` (lines 293, 316, 344, 367, 424, 444, 464, 500)
- Revert to direct assignment: `result.overrides = spec.overrides`

**Impact**: Eliminates the temporary "take first element" workaround since CLI-v2 now natively supports arrays.

## Implementation Notes

1. **Backward Compatibility**: Changes are backward compatible since `string` is a subset of `string | string[]`
2. **Processing Order**: When multiple override files are specified, they should be applied sequentially in the order specified
3. **Error Handling**: Each override file is validated independently, with clear error messages indicating which file is problematic
4. **Testing**: Ensure both single and multiple override scenarios are covered in tests

## Files Changed Summary

1. **Zod Schemas**: 4 schema files (OpenApi, AsyncApi, Protobuf, OpenRpc)
2. **Converter**: 1 file with 4 method updates
3. **Interfaces**: 4 interface files
4. **Migrator Cleanup**: 1 file (remove workaround)

**Total**: ~10 files modified across the three-tier architecture.