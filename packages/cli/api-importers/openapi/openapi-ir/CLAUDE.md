# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@fern-api/openapi-ir` defines the OpenAPI Intermediate Representation (IR) type system. It contains both the **parse IR** (`SchemaWithExample`, used during OpenAPI parsing) and the **final IR** (`Schema`, used after example stripping). Types are defined as Fern API definitions in `fern/definition/` and auto-generated into TypeScript.

## Code Generation

The TypeScript types in `src/sdk/` are **auto-generated** from the Fern definitions in `fern/definition/`. Do not edit them manually.

To regenerate after changing the Fern definitions:
```bash
# From the repository root
pnpm openapi-ir:generate
```

## Key Files

- `fern/definition/finalIr.yml` - Final IR type definitions (post-example-stripping)
- `fern/definition/parseIr.yml` - Parse IR type definitions (with examples)
- `fern/definition/commons.yml` - Shared mixins (`WithName`, `WithDescription`, etc.)
- `fern/generators.yml` - Generator configuration for TypeScript SDK output
- `src/sdk/` - Auto-generated TypeScript types (do not edit manually)
