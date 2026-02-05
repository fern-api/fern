# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This package (`@fern-api/openapi-ir-to-fern`) converts OpenAPI Intermediate Representation (IR) to Fern Definition format. It is the second stage of a two-stage OpenAPI import pipeline:

1. `openapi-ir-parser` → Parses OpenAPI specs into OpenAPI IR
2. **`openapi-ir-to-fern`** → Converts OpenAPI IR to Fern Definition

## Development Commands

```bash
# From this package directory
pnpm compile           # Compile TypeScript
pnpm test             # Run tests (uses vitest)
pnpm test:update      # Update test snapshots
pnpm clean            # Remove build artifacts

# From repository root (preferred for running tests)
pnpm turbo run test --filter @fern-api/openapi-ir-to-fern
pnpm turbo run compile --filter @fern-api/openapi-ir-to-fern
```

**Note:** Tests for this package are in a separate package: `@fern-api/openapi-ir-to-fern-tests` (located in `../openapi-ir-to-fern-tests/`).

## Architecture

### Entry Point
- `convert.ts` - Main entry point. Creates `OpenApiIrConverterContext` and calls `buildFernDefinition`

### Core Components

**Context (`OpenApiIrConverterContext.ts`)**
- Holds conversion state and configuration
- Provides schema lookup via `getSchema(id, namespace)` - schemas can be in `rootSchemas` or `namespacedSchemas`
- Tracks processing state (`State.Endpoint`, `State.Channel`, `State.Webhook`, `State.Request`)
- Manages schema reference tracking for `onlyIncludeReferencedSchemas` option
- Contains `FernDefinitionBuilder` for building output

**Options (`ConvertOpenAPIOptions.ts`)**
- `enableUniqueErrorsPerEndpoint` - SDKs share errors, docs get unique errors
- `detectGlobalHeaders` - Extract common headers as global
- `objectQueryParameters` - Allow complex query params
- `respectReadonlySchemas` - Skip readonly props in write endpoints
- `onlyIncludeReferencedSchemas` - Exclude unreferenced schemas
- `inlinePathParameters` - Include path params in request body
- `wrapReferencesToNullableInOptional` - Handle nullable semantics
- `groupEnvironmentsByHost` - Group multi-protocol environments

**Builder Pattern**
Uses `FernDefinitionBuilder` (from `@fern-api/importer-commons`) to accumulate:
- Types → `builder.addType(file, {name, schema})`
- Endpoints → `builder.addEndpoint(file, {name, schema, source})`
- Errors → `builder.addError(file, {name, schema})`
- Imports → `builder.addImport({file, fileToImport})`

### Build Functions

| File | Purpose |
|------|---------|
| `buildFernDefinition.ts` | Orchestrates the full conversion |
| `buildServices.ts` | Converts endpoints, tracks SDK groups |
| `buildEndpoint.ts` | Converts single endpoint with request/response |
| `buildTypeDeclaration.ts` | Converts schemas to type declarations |
| `buildTypeReference.ts` | Converts schemas to type references |
| `buildAuthSchemes.ts` | Converts security schemes |
| `buildEnvironments.ts` | Converts server definitions |
| `buildChannel.ts` | Converts WebSocket channels |
| `buildWebhooks.ts` | Converts webhook definitions |

### Key Patterns

**Schema Resolution**
```typescript
// Schemas are organized by namespace
context.getSchema(schemaId, namespace)  // looks up in appropriate location
// namespace=undefined → rootSchemas
// namespace="foo" → namespacedSchemas["foo"]
```

**State Tracking**
```typescript
context.setInState(State.Endpoint);
// ... process endpoint
context.unsetInState(State.Endpoint);
```

**Type Reference vs Declaration**
- `buildTypeReference` - Returns inline type reference (e.g., `"string"`, `"optional<Foo>"`)
- `buildTypeDeclaration` - Returns named type declaration to add to a file

**Declaration Depth**
The `declarationDepth` parameter tracks nesting level. Nested types (depth > 0) are marked as inline.

## Key Dependencies

- `@fern-api/openapi-ir` - Input IR types
- `@fern-api/fern-definition-schema` - Output schema types
- `@fern-api/importer-commons` - `FernDefinitionBuilder` interface

## Common Debugging

When debugging schema resolution issues:
1. Check if schema is in `rootSchemas` vs `namespacedSchemas`
2. Verify the `namespace` parameter being passed matches where the schema lives
3. Note: The code has DEBUG console.log statements in `getSchema` and `buildReferenceTypeReference` (currently active)
