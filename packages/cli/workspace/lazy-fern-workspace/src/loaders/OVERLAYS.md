# OpenAPI Overlay Support

This document summarizes the implementation of OpenAPI Overlay Specification v1.0.0 support in the Fern CLI.

## Overview

OpenAPI Overlays provide a way to modify OpenAPI documents without directly editing the source file. This is useful for adding custom extensions, modifying descriptions, or making other changes that should be applied on top of the base specification.

**Specification**: https://spec.openapis.org/overlay/latest.html

## Changes Made

### 1. Schema Updates

**File**: `packages/cli/configuration/src/generators-yml/schemas/api/resources/generators/types/OpenApiSpecSchema.ts`

Added optional `overlays` field to `OpenApiSpecSchema` interface (user-provided change):
```typescript
export interface OpenApiSpecSchema {
    openapi: string;
    origin?: string;
    overrides?: string;
    overlays?: string;  // NEW
    namespace?: string;
    settings?: FernDefinition.OpenApiSettingsSchema;
}
```

### 2. Configuration Plumbing

**File**: `packages/cli/configuration/src/generators-yml/GeneratorsConfiguration.ts`

Added `overlays` to `APIDefinitionLocation` interface:
```typescript
export interface APIDefinitionLocation {
    schema: APIDefinitionSchema;
    origin: string | undefined;
    overrides: string | undefined;
    overlays: string | undefined;  // NEW
    audiences: string[] | undefined;
    settings: APIDefinitionSettings | undefined;
}
```

**File**: `packages/cli/configuration-loader/src/generators-yml/convertGeneratorsConfiguration.ts`

Updated all places where `APIDefinitionLocation` objects are created to include `overlays` field. For OpenAPI specs, this reads from `spec.overlays`. For other spec types (AsyncAPI, Protobuf, OpenRPC), this is set to `undefined` since overlays are only supported for OpenAPI.

### 3. Spec Type Updates

**File**: `packages/cli/workspace/commons/src/Spec.ts`

Added `absoluteFilepathToOverlays` only to `OpenAPISpec` interface:
```typescript
export interface OpenAPISpec {
    type: "openapi";
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
    absoluteFilepathToOverlays: AbsoluteFilePath | undefined;  // NEW
    source: Source;
    namespace?: string;
    settings?: ParseOpenAPIOptions;
}
```

Note: Overlays are NOT supported for `ProtobufSpec`, `OpenRPCSpec`, or `AsyncAPISpec`.

### 4. Workspace Loading

**File**: `packages/cli/workspace/loader/src/loadAPIWorkspace.ts`

- Resolves the `overlays` path relative to the generators.yml file
- Validates that the overlay file exists (similar to overrides validation)
- Passes `absoluteFilepathToOverlays` to the spec objects

### 5. Overlay Implementation

**File**: `packages/cli/workspace/lazy-fern-workspace/src/loaders/applyOverlays.ts` (NEW)

Full implementation of OpenAPI Overlay Specification v1.0.0:

- **Parsing**: Supports both YAML and JSON overlay files
- **Validation**: Validates overlay structure (version, info, actions)
- **Actions**: Supports both `update` and `remove` actions
- **JSONPath**: Uses `jsonpath-plus` library for target selection
- **Deep Merge**: Updates are merged recursively into matched targets
- **Debugging**: Writes overlaid spec to temp directory and logs the path
- **Testing**: Tests for core application function verify spec requirements

Key implementation details:
- Uses `structuredClone()` when merging to avoid shared object references (prevents swagger2openapi from detecting "YAML anchors")
- Actions are applied sequentially - each action operates on the result of the previous
- Remove actions support both array elements and object properties

### 6. OpenAPI Loading Integration

**File**: `packages/cli/workspace/lazy-fern-workspace/src/utils/loadOpenAPI.ts`

- Added `absolutePathToOpenAPIOverlays` parameter
- Overlays are applied after overrides (order: original → overrides → overlays)
- Updated re-parse condition to include overlays

**File**: `packages/cli/workspace/lazy-fern-workspace/src/loaders/OpenAPILoader.ts`

- Passes `spec.absoluteFilepathToOverlays` to `loadOpenAPI()`

**File**: `packages/cli/workspace/oss-validator/src/rules/no-duplicate-overrides/no-duplicate-overrides.ts`

- Updated `loadOpenAPI` call to include the new parameter

## Usage

In `generators.yml`:
```yaml
api:
  - openapi: ./openapi.yaml
    overlays: ./overlay.yaml
```

Example overlay file:
```yaml
overlay: "1.0.0"
info:
  title: My API Overlay
  version: "1.0.0"
actions:
  - target: $.paths.*.*
    description: Add public audience to all operations
    update:
      x-fern-audiences:
        - public

  - target: $.paths./internal.*
    description: Remove internal endpoints
    remove: true
```

## Dependencies

- `jsonpath-plus`: JSONPath implementation for target selection
- `tmp-promise`: Temp directory creation for debug output

## Limitations

1. **JSONPath Filters**: Filter expressions like `[?(@.foo == "bar")]` only work on arrays, not object property values. Complex conditional logic based on property values is not supported.

2. **Array Selectors**: The spec gives examples like `[?@.foo == 'bar']` (no parens), but jsonpath-plus requires parens for targeting array items with selectors `[?(@.foo == 'bar')]`.

2. **OpenAPI Only**: Overlays are only supported for OpenAPI specs, not AsyncAPI, Protobuf, or OpenRPC.

## Debug Output

When an overlay is applied, the resulting spec is written to a temp directory:
```
[api]: Wrote overlaid OpenAPI spec to: /var/folders/.../fern-overlay-xxx/openapi.overlaid.json
```

This allows inspection of the overlaid result for debugging purposes.