# @fern-api/migrations-base

Base types and utilities for Fern generator migrations.

## Overview

This package provides common types and helper functions that can be shared across all generator migration packages. It ensures consistency and reduces code duplication.

## Installation

```bash
npm install @fern-api/migrations-base
```

## Usage

### Types

```typescript
import type { Migration, MigrationModule, GeneratorsYmlDocument } from "@fern-api/migrations-base";

const migration: Migration = {
  version: "2.0.0",
  migrateGeneratorConfig: (config) => {
    // Your migration logic
    return config;
  },
  migrateGeneratorsYml: (document) => document
};

export const migrations: MigrationModule["migrations"] = [migration];
```

### Helper Functions

#### `getConfigObject(config)`

Safely extracts the config object from a generator invocation:

```typescript
import { getConfigObject } from "@fern-api/migrations-base";

const configObj = getConfigObject(config);
// Returns empty object if config is undefined or not an object
```

#### `setIfUndefined(configObj, field, defaultValue)`

Sets a field only if it's currently undefined:

```typescript
import { getConfigObject, setIfUndefined } from "@fern-api/migrations-base";

const configObj = getConfigObject(config);
const migratedConfig = {
  ...configObj,
  ...setIfUndefined(configObj, "newField", "default"),
  ...setIfUndefined(configObj, "anotherField", true)
};
```

#### `applyDefaults(configObj, defaults)`

Applies multiple defaults in a single call:

```typescript
import { getConfigObject, applyDefaults, createMigratedConfig } from "@fern-api/migrations-base";

const configObj = getConfigObject(config);
const migratedConfig = applyDefaults(configObj, {
  field1: "default1",
  field2: true,
  field3: 42
});

return createMigratedConfig(config, migratedConfig);
```

#### `createMigratedConfig(originalConfig, migratedConfigObj)`

Creates a new generator config with the migrated config object:

```typescript
import { getConfigObject, createMigratedConfig } from "@fern-api/migrations-base";

const configObj = getConfigObject(config);
const migratedConfigObj = {
  ...configObj,
  newField: "value"
};

return createMigratedConfig(config, migratedConfigObj);
```

## Complete Example

```typescript
import type { Migration } from "@fern-api/migrations-base";
import { applyDefaults, createMigratedConfig, getConfigObject } from "@fern-api/migrations-base";

export const migration_2_0_0: Migration = {
  version: "2.0.0",

  migrateGeneratorConfig: (config) => {
    const configObj = getConfigObject(config);

    // Apply old defaults for backwards compatibility
    const migratedConfig = applyDefaults(configObj, {
      streamType: "wrapper",
      fileResponseType: "stream",
      formDataSupport: "Node16",
      fetchSupport: "node-fetch"
    });

    return createMigratedConfig(config, migratedConfig);
  },

  migrateGeneratorsYml: (document) => document
};
```

## Benefits

- **Type Safety**: Shared TypeScript types across all migration packages
- **Consistency**: Same helper functions used everywhere
- **Less Boilerplate**: Common patterns abstracted into utilities
- **Better Maintainability**: Changes propagate to all migration packages
- **Easier Testing**: Shared utilities are tested once

## For Migration Package Authors

When creating a new generator migration package:

1. Add `@fern-api/migrations-base` as a dependency
2. Import types and utilities
3. Use helper functions to reduce boilerplate
4. Focus on the migration logic, not the plumbing

See `/generators/typescript/migrations/` for a complete example.
