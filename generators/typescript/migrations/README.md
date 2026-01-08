# TypeScript SDK Generator Migrations

This package contains configuration migrations for the TypeScript SDK generator.

## What are migrations?

When the TypeScript SDK generator's configuration schema changes in a breaking way, migrations allow users to automatically transform their `generators.yml` configuration during upgrades.

## How it works

When users run:
```bash
fern generator upgrade --generator typescript-sdk
```

The Fern CLI:
1. Detects the version upgrade (e.g., from 1.5.0 to 2.0.0)
2. Loads this migration package from npm
3. Filters migrations to the version range
4. Applies them sequentially to transform the configuration

## Project Structure

Migrations are organized into separate files for better maintainability:

```
src/
├── index.ts              # Main entry point, exports migrations array
├── migrations/
│   ├── types.ts          # TypeScript types for migrations
│   ├── index.ts          # Exports all migrations
│   ├── 1.0.0.ts         # Migration for version 1.0.0
│   ├── 2.0.0.ts         # Migration for version 2.0.0
│   └── 3.0.0.ts         # Migration for version 3.0.0
└── __test__/
    └── migrations.test.ts # Tests for all migrations
```

## Adding a migration

When making a breaking change to the generator's configuration:

1. **Create a new migration file** `src/migrations/{version}.ts`:

```typescript
import type { generatorsYml } from "@fern-api/configuration";
import { GeneratorsYmlDocument, Migration } from "./types";

/**
 * Migration for version 4.0.0
 *
 * Document what changed and why the migration is needed.
 */
export const migration_4_0_0: Migration = {
    version: "4.0.0",  // Version this upgrades TO

    migrateGeneratorConfig: (config) => {
        const configObj =
            config.config && typeof config.config === "object"
                ? (config.config as Record<string, unknown>)
                : {};

        // Only set old defaults if not already explicitly configured
        const migratedConfig = {
            ...configObj,
            ...(configObj.newField === undefined ? { newField: "old-default" } : {})
        };

        return {
            ...config,
            config: migratedConfig
        };
    },

    migrateGeneratorsYml: (document) => {
        // Only needed for document-level changes
        return document;
    }
};
```

2. **Export from `src/migrations/index.ts`**:

```typescript
export { migration_4_0_0 } from "./4.0.0";
```

3. **Add to the migrations array in `src/index.ts`**:

```typescript
import { migration_1_0_0, migration_2_0_0, migration_3_0_0, migration_4_0_0 } from "./migrations";

export const migrations = [
    migration_1_0_0,
    migration_2_0_0,
    migration_3_0_0,
    migration_4_0_0  // Add new migration
];
```

4. **Add tests** in `src/__test__/migrations.test.ts`

5. **Update this package version** in `package.json` (use semantic versioning for the migration package itself)

6. **Compile and publish**:
```bash
pnpm compile
npm publish
```

## Common migration patterns

### Adding a field with a default value

```typescript
migrateGeneratorConfig: (config) => ({
    ...config,
    config: {
        ...(typeof config.config === 'object' ? config.config : {}),
        newField: "default"
    }
})
```

### Renaming a field

```typescript
migrateGeneratorConfig: (config) => {
    const cfg = typeof config.config === 'object' ? config.config : {};
    if ('oldName' in cfg) {
        const { oldName, ...rest } = cfg;
        return {
            ...config,
            config: { ...rest, newName: oldName }
        };
    }
    return config;
}
```

### Removing a deprecated field

```typescript
migrateGeneratorConfig: (config) => {
    const cfg = typeof config.config === 'object' ? config.config : {};
    if ('deprecated' in cfg) {
        const { deprecated, ...rest } = cfg;
        return { ...config, config: rest };
    }
    return config;
}
```

### Transforming values

```typescript
migrateGeneratorConfig: (config) => ({
    ...config,
    config: {
        ...(typeof config.config === 'object' ? config.config : {}),
        timeout: typeof config.config?.timeout === 'number'
            ? config.config.timeout * 1000  // Convert to milliseconds
            : 30000
    }
})
```

## Best practices

1. **Pure functions**: Always return new objects, never mutate
2. **Idempotent**: Migrations should be safe to run multiple times
3. **Defensive**: Don't assume fields exist, use optional chaining
4. **Preserve data**: Use spread operators to keep fields you don't modify
5. **Document**: Add comments explaining why the migration is needed
6. **Test**: Test migrations with various configurations before publishing

## Testing locally

Before publishing, test migrations locally:

```bash
# Build the package
pnpm compile

# Link it locally
npm link

# In a test Fern project
npm link @fern-api/generator-migration-typescript-sdk

# Run upgrade
fern generator upgrade --generator typescript-sdk
```

## Publishing

This package should be published to npm when:
- New migrations are added
- The generator makes breaking configuration changes
- Users need to upgrade between versions with schema changes

```bash
pnpm compile
npm publish
```

## Version strategy

- The generator version (e.g., `2.0.0`) is what appears in `generators.yml`
- The migration package version is independent and follows its own semver
- Migration objects use the generator version they upgrade TO

Example:
- Generator version: `2.0.0` (the new version)
- Migration package version: `1.1.0` (independent versioning)
- Migration object: `{ version: "2.0.0", ... }` (matches generator version)
