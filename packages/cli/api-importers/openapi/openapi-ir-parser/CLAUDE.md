# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@fern-api/openapi-ir-parser` parses OpenAPI 3.x and AsyncAPI 2.x/3.x documents into Fern's OpenAPI Intermediate Representation (IR). This IR is then consumed by `openapi-ir-to-fern` to produce Fern Definition files.

## Development Commands

```bash
# From this package directory
pnpm compile           # Compile TypeScript
pnpm test             # Run tests
pnpm test:update      # Update test snapshots

# Run a single test file
pnpm vitest --run src/__test__/convertSecurityScheme.test.ts
```

## Architecture

### Entry Point

`src/parse.ts` exports the main `parse()` function that accepts an array of `Document` objects (either OpenAPI or AsyncAPI) and returns a unified `OpenApiIntermediateRepresentation`.

### Core Processing Flow

```
OpenAPI 3.x Document  ─┬─→  generateIr() ─────┬─→  OpenApiIntermediateRepresentation
                       │                      │
AsyncAPI 2.x/3.x Doc  ─┴─→  parseAsyncAPI() ─┴─→  (merged via merge())
```

### Directory Structure

- **`src/openapi/v3/`** - OpenAPI 3.x parsing
  - `generateIr.ts` - Main IR generation entry point
  - `OpenAPIV3ParserContext.ts` - Parser context with reference resolution
  - `converters/` - Convert paths, operations, security schemes, servers
  - `extensions/` - Handle `x-fern-*` and other OpenAPI extensions

- **`src/asyncapi/`** - AsyncAPI parsing
  - `v2/` - AsyncAPI 2.x support
  - `v3/` - AsyncAPI 3.x support
  - `parse.ts` - Entry point that dispatches to v2/v3

- **`src/schema/`** - Schema conversion (shared between OpenAPI and AsyncAPI)
  - `convertSchemas.ts` - Main schema conversion logic (handles references, oneOf, allOf, etc.)
  - Type-specific converters: `convertObject.ts`, `convertEnum.ts`, `convertDiscriminatedOneOf.ts`, etc.
  - `examples/` - Example generation from schemas
  - `utils/` - Schema utilities

- **`src/options.ts`** - `ParseOpenAPIOptions` interface defining all parsing configuration

### Key Types

- `ParseOpenAPIOptions` - Controls parsing behavior (discriminated unions, examples, audiences, etc.)
- `SchemaParserContext` - Interface for context during schema parsing, provides reference resolution
- `OpenAPIV3ParserContext` - Full context for OpenAPI v3 parsing, tracks schemas referenced by requests vs non-requests

### Extension Handling

Fern-specific extensions (`x-fern-*`) are defined in `src/openapi/v3/extensions/fernExtensions.ts`. Extension values are extracted via `getExtension()` from `src/getExtension.ts`.

## Key Patterns

### Reference Resolution

References (`$ref`) are resolved through the parser context. The context tracks which schemas are referenced by requests vs other locations, affecting IR output.

### Schema Conversion

`convertSchema()` in `src/schema/convertSchemas.ts` is recursive and handles:
- Reference objects → lookup and recurse
- Object schemas → `convertObject()`
- oneOf/anyOf → `convertDiscriminatedOneOf()` or `convertUndiscriminatedOneOf()`
- allOf → merged into object
- Primitives, arrays, enums

### Multi-Document Merging

When parsing multiple documents, `merge()` in `src/parse.ts` combines IRs. The `groupMultiApiEnvironments` option enables environment grouping across APIs with matching environment names but different URLs.

## Dependencies

- `@fern-api/openapi-ir` - IR type definitions (sibling package)
- `@fern-api/configuration` - Generator config types
- `@redocly/openapi-core` - OpenAPI parsing utilities
- `openapi-types` - TypeScript types for OpenAPI 3.x
