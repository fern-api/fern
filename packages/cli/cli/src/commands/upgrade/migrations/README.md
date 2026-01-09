# Generator Migration System

This directory contains the implementation of the generator migration system for the Fern CLI.

## Overview

The migration system allows generator authors to publish migration packages that automatically transform `generators.yml` configuration during version upgrades. This enables breaking changes to generator configuration schemas without requiring manual user intervention.

## Architecture

### Migration Flow

When a user runs `fern generator upgrade`:

1. **CLI detects version change** - Compares current version to latest version
2. **Loads unified migration package** - Downloads `@fern-api/generator-migrations@latest` from npm to local cache (`~/.fern/migration-cache/`)
3. **Looks up generator migrations** - Finds migrations for the specific generator by its full name (e.g., `fernapi/fern-typescript-sdk`)
4. **Filters migrations** - Selects migrations where `from < version <= to`
5. **Sorts migrations** - Orders by version ascending
6. **Applies sequentially** - Pipes output of each migration to input of next
7. **Updates YAML** - Writes transformed configuration back to `generators.yml`

### Unified Package Architecture

All generator migrations are consolidated into a single npm package: `@fern-api/generator-migrations`.

**Benefits:**
- **Simpler maintenance** - One package to version and publish
- **Easier discovery** - Single source of truth for all migrations
- **Better for monorepo** - Fits naturally into the Fern monorepo structure
- **Consistent versioning** - All generators migrate together
- **Reduced installation overhead** - Only one package to download

The package exports a record mapping full generator names (with `fernapi/` prefix) to migration modules:

```typescript
export const migrations: Record<string, MigrationModule> = {
    "fernapi/fern-typescript": typescriptSdkMigrations,
    "fernapi/fern-typescript-sdk": typescriptSdkMigrations,
    "fernapi/fern-typescript-node-sdk": typescriptSdkMigrations,
    "fernapi/fern-typescript-browser-sdk": typescriptSdkMigrations
    // Additional generators added here as migrations are implemented
};
```

### Currently Supported Generators

**TypeScript SDK** (all variants share migrations):
- `fernapi/fern-typescript`
- `fernapi/fern-typescript-sdk`
- `fernapi/fern-typescript-node-sdk`
- `fernapi/fern-typescript-browser-sdk`

### Adding Migrations for New Generators

See [packages/generator-migrations/README.md](../../../../../generator-migrations/README.md) for detailed instructions on adding migrations for additional generators.

### Migration Module Contract

Each generator's migration module exports a `MigrationModule` object containing an array of migrations:

```typescript
import type { MigrationModule } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

export const migration_1_0_0: Migration = {
  version: "1.0.0",  // Version this migration upgrades TO

  migrateGeneratorConfig: ({ config, context }) =>
    migrateConfig(config, (draft) => {
      // Transform individual generator config using Immer
      draft.newField ??= "default-value";
    }),

  migrateGeneratorsYml: ({ document, context }) => {
    // Transform entire generators.yml (rarely needed)
    return document;
  }
};

const migrationModule: MigrationModule = {
  migrations: [migration_1_0_0]
};

export default migrationModule;
```

All types (`Migration`, `MigrationModule`, `MigrationContext`, etc.) are defined in `@fern-api/migrations-base` to ensure consistency across all generators.

## Implementation Files

### [types.ts](types.ts)
Re-exports core types from `@fern-api/migrations-base`:
- `Migration` - Contract for individual migrations
- `MigrationModule` - Contract for migration packages (with `migrations` array)
- `MigrationResult` - Return type with metadata
- `MigrationContext` - Context passed to migrations (includes logger)
- `GeneratorsYmlDocument` - Structure for document-level migrations

### [loader.ts](loader.ts)
Core implementation:
- `getMigrationCacheDir()` - Returns cache directory path (`~/.fern/migration-cache/`)
- `isValidGeneratorConfig()` - Runtime type guard for config validation (see [TYPE_SAFETY.md](TYPE_SAFETY.md))
- `loadMigrationModule()` - Downloads unified package and looks up generator-specific migrations
- `filterMigrations()` - Selects migrations where `from < version <= to`
- `runMigrations()` - Applies migrations sequentially, piping outputs
- `loadAndRunMigrations()` - Main entry point combining load + filter + run with validation

### [index.ts](index.ts)
Public exports for use by the CLI.

## Integration with CLI

The migration system is integrated into [`upgradeGenerator.ts`](../upgradeGenerator.ts) at lines 183-216.

After updating a generator version in YAML, the CLI:
1. Converts YAML to JSON
2. Calls `loadAndRunMigrations()`
3. Applies migrated config back to YAML
4. Logs migration count and versions

If migrations fail, the upgrade continues (graceful degradation).

## Security

### Package Installation

The unified migration package is installed to a local cache directory:
```bash
npm install @fern-api/generator-migrations@latest \
  --prefix ~/.fern/migration-cache \
  --ignore-scripts \
  --no-audit \
  --no-fund
```

- `--prefix` - Installs to local cache instead of project `node_modules`
- `--ignore-scripts` - Prevents arbitrary code execution during installation
- `--no-audit` - Skips security audit for faster installation
- `--no-fund` - Suppresses funding messages

npm's package cache (`~/.npm`) provides fast installs without repeated downloads.

### Runtime Validation

The migration loader validates configuration structure before processing:
- Ensures config is an object with required properties
- Prevents crashes from malformed YAML parsing
- Logs warnings for invalid configurations
- Gracefully skips migrations if config is invalid

See [TYPE_SAFETY.md](TYPE_SAFETY.md) for detailed documentation on runtime validation.

## Error Handling

The migration system gracefully handles errors:
- If the unified package is not found on npm (404 error), logs an info message and continues without migrations
- If a generator has no migrations registered in the package, logs a debug message and continues
- If installation or loading fails for other reasons, logs a warning and continues
- The upgrade process never fails due to migration issues

This ensures users can always upgrade generators, even if migrations are unavailable.

## Example Migrations

See the TypeScript SDK migrations in the unified package for complete examples:
[`/packages/generator-migrations/src/generators/typescript/migrations/`](/packages/generator-migrations/src/generators/typescript/migrations/)

This demonstrates:
- Migration file structure and naming
- Using the `migrateConfig` helper with Immer
- Setting old defaults for backwards compatibility
- Comprehensive documentation with before/after examples
- Testing patterns

## Testing

### Unit Tests

See [`__test__/loader.test.ts`](__test__/loader.test.ts) for examples testing:
- Sequential migration application
- Piping between migrations
- Field transformations (add, rename, remove)
- Edge cases (empty arrays, missing fields)

Run tests:
```bash
pnpm test -- migrations/__test__/loader.test.ts
```

### Integration Testing

Test with a real Fern project:

```bash
# Link unified migration package locally for development
cd packages/generator-migrations
npm link

# Create symlink in migration cache directory
mkdir -p ~/.fern/migration-cache/node_modules/@fern-api
cd ~/.fern/migration-cache/node_modules/@fern-api
ln -s /path/to/fern/packages/generator-migrations generator-migrations

# Run upgrade in test project
cd /path/to/test-project
fern generator upgrade --generator typescript-sdk

# Clean up after testing
rm ~/.fern/migration-cache/node_modules/@fern-api/generator-migrations
```

## Common Migration Patterns

### Setting Defaults (Most Common)

Use the nullish coalescing assignment operator (`??=`) to set values only if undefined:

```typescript
import { migrateConfig } from "@fern-api/migrations-base";

migrateGeneratorConfig: ({ config }) =>
  migrateConfig(config, (draft) => {
    draft.field1 ??= false;
    draft.field2 ??= "default-value";
    draft.field3 ??= true;
  })
```

### Renaming Fields

```typescript
migrateConfig(config, (draft) => {
  if (draft.oldFieldName !== undefined) {
    draft.newFieldName = draft.oldFieldName;
    delete draft.oldFieldName;
  }
})
```

### Removing Fields

```typescript
migrateConfig(config, (draft) => {
  delete draft.deprecatedField;
})
```

### Conditional Transformations

```typescript
migrateConfig(config, (draft) => {
  if (draft.oldFormat === "legacy") {
    draft.newFormat = { type: "modern", legacy: true };
    delete draft.oldFormat;
  }
})
```

For more patterns and examples, see the [generator-migrations package README](/packages/generator-migrations/README.md#migration-patterns).

## Best Practices

1. **Pure Functions** - Use the `migrateConfig` helper with Immer, never mutate input directly
2. **Idempotent** - Use `??=` to set values only if undefined, making migrations safe to run multiple times
3. **Defensive Coding** - Don't assume fields exist, check before accessing nested properties
4. **Preserve Unknown Fields** - Immer automatically preserves fields you don't modify
5. **Document Intent** - Add comprehensive comments explaining why defaults changed and what the migration does
6. **Version Alignment** - Migration version must match the generator version it upgrades TO
7. **Test Thoroughly** - Test with empty configs, partially configured, and fully configured scenarios

For complete best practices and examples, see:
- [generator-migrations README](/packages/generator-migrations/README.md#migration-best-practices)
- [migrations-base README](/packages/migrations-base/README.md)
- [TypeScript SDK migration examples](/packages/generator-migrations/src/generators/typescript/migrations/)

## Related Documentation

- [Unified Migration Package](/packages/generator-migrations/README.md) - Adding migrations for new generators
- [migrations-base Package](/packages/migrations-base/README.md) - Core types and utilities
- [Type Safety Documentation](TYPE_SAFETY.md) - Runtime validation strategy

## Future Enhancements

Potential improvements tracked in GitHub issues:
- Dry-run mode to preview migrations before applying
- Migration rollback support for recovering from issues
- Schema validation of migrated configs against generator schemas
- Telemetry to understand which migrations are commonly needed
