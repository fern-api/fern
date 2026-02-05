# @fern-api/migrations-base

Base utilities and types for Fern generator configuration migrations using [Immer](https://immerjs.github.io/immer/).

## Overview

This package provides the `migrateConfig()` function for writing clean, immutable generator configuration migrations using Immer.

## Installation

```bash
npm install @fern-api/migrations-base
```

## Usage

```typescript
import { migrateConfig, type Migration } from "@fern-api/migrations-base";

export const migration_1_0_0: Migration = {
    version: "1.0.0",
    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            // Your migration logic here
            // draft is a mutable proxy that Immer converts to immutable updates
        }),
    migrateGeneratorsYml: ({ document }) => document
};
```

## Migration Patterns

### Setting Defaults

Use the nullish coalescing assignment operator (`??=`) to set values only if undefined:

```typescript
migrateConfig(config, (draft) => {
    draft.field1 ??= false;
    draft.field2 ??= "default-value";
    draft.field3 ??= true;
});
```

### Removing Fields

```typescript
migrateConfig(config, (draft) => {
    delete draft.deprecatedField;
});
```

### Renaming Fields

```typescript
migrateConfig(config, (draft) => {
    draft.newFieldName = draft.oldFieldName;
    delete draft.oldFieldName;
});
```

### Nested Updates

```typescript
migrateConfig(config, (draft) => {
    draft.nested ??= {};
    draft.nested.field1 = "value";
    draft.nested.field2 = true;
});
```

### Conditional Transformations

```typescript
migrateConfig(config, (draft) => {
    if (draft.deprecated === "old-value") {
        delete draft.deprecated;
    }

    if (typeof draft.oldFormat === "string") {
        draft.newFormat = { type: draft.oldFormat };
        delete draft.oldFormat;
    }
});
```

## Example

```typescript
import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

/**
 * Migration for version 2.0.0
 *
 * Changed defaults:
 * - streamType: "wrapper" → "web"
 * - fileResponseType: "stream" → "binary-response"
 */
export const migration_2_0_0: Migration = {
    version: "2.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            draft.streamType ??= "wrapper";
            draft.fileResponseType ??= "stream";
        }),

    migrateGeneratorsYml: ({ document }) => document
};
```
