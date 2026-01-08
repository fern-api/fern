# Generator Migration System

This directory contains the implementation of the generator migration system for the Fern CLI.

## Overview

The migration system allows generator authors to publish migration packages that automatically transform `generators.yml` configuration during version upgrades. This enables breaking changes to generator configuration schemas without requiring manual user intervention.

## Architecture

### Migration Flow

When a user runs `fern generator upgrade`:

1. **CLI detects version change** - Compares current version to latest version
2. **Loads migration package** - Attempts to download `@fern-api/generator-migration-{generator}` from npm
3. **Filters migrations** - Selects migrations where `from < version <= to`
4. **Sorts migrations** - Orders by version ascending
5. **Applies sequentially** - Pipes output of each migration to input of next
6. **Updates YAML** - Writes transformed configuration back to `generators.yml`

### Package Naming Convention

Migration packages are registered in the `GENERATOR_MIGRATION_PACKAGES` map in [`loader.ts`](loader.ts). This provides an explicit, centralized mapping between generators and their migration packages.

To add a new migration package:
1. Create the package under `generators/{language}/migrations/`
2. Uncomment the corresponding entry in `GENERATOR_MIGRATION_PACKAGES` in [`loader.ts`](loader.ts)
3. Publish the package to npm

Currently available migration packages:
- `typescript-sdk` → `@fern-api/typescript-sdk-migrations`
- `typescript` → `@fern-api/typescript-sdk-migrations`

Future migration packages (commented out in map):
- **TypeScript**: `typescript-node-sdk`, `typescript-browser-sdk`, `typescript-express`
- **Python**: `python-sdk`, `fastapi-server`, `pydantic-model`
- **Java**: `java-sdk`, `java`, `java-model`, `java-spring`
- **Go**: `go-sdk`, `go-model`, `go-fiber`
- **C#**: `csharp-sdk`, `csharp-model`
- **Ruby**: `ruby-sdk`, `ruby-model`
- **PHP**: `php-sdk`, `php-model`
- **Rust**: `rust-sdk`, `rust-model`
- **Swift**: `swift-sdk`, `swift-model`
- **Other**: `openapi`, `stoplight`, `postman`, `openapi-python-client`

All generator names match those defined in `packages/cli/configuration/src/generators-yml/schemas/GeneratorName.ts`

The map uses full generator names (with `fernapi/` prefix) as keys for exact matching.

### Migration Package Contract

Each migration package must default export a `MigrationModule` object:

```typescript
import type { MigrationModule } from "@fern-api/migrations-base";

const migrationModule: MigrationModule = {
  migrations: [
    {
      version: "2.0.0",  // Version this migration upgrades TO
      migrateGeneratorConfig: ({ config, context }) => {
        // Transform individual generator config
        return config;
      },
      migrateGeneratorsYml: ({ document, context }) => {
        // Transform entire generators.yml (optional)
        return document;
      }
    }
  ]
};

export default migrationModule;
```

All types (`Migration`, `MigrationModule`, `MigrationContext`, etc.) are defined in `@fern-api/migrations-base` to ensure consistency across all migration packages.

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
- `GENERATOR_MIGRATION_PACKAGES` - Map of full generator names to migration package names
- `loadMigrationModule()` - Downloads and imports migration packages from npm (with user-friendly error logging)
- `runMigrations()` - Applies migrations sequentially (uses options object pattern)
- `loadAndRunMigrations()` - Main entry point combining load + run
- `filterMigrations()` - Selects applicable migrations by version range

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

Migration packages are installed with:
```bash
npm install {package}@latest --ignore-scripts --no-audit --no-fund
```

The `--ignore-scripts` flag prevents arbitrary code execution during installation.

## Error Handling

The migration system gracefully handles missing packages:
- If a generator has no migration package registered in the map, it logs a debug message and continues
- If a package is not found on npm (404 error), it logs an info message explaining the upgrade will continue without migrations
- If installation fails for other reasons, it logs a warning with the error details and continues
- The upgrade process never fails due to missing migration packages

## Example Migration Package

See the TypeScript SDK migration package for a complete example:
[`/generators/typescript/generator-migration/`](/generators/typescript/generator-migration/)

This demonstrates:
- Package structure and configuration
- Migration implementation patterns
- Common transformations (add, rename, remove fields)
- Testing and publishing workflow

## Creating a Migration Package

### 1. Create Package Structure

```
generators/{language}/generator-migration/
├── package.json
├── tsconfig.json
├── src/
│   └── index.ts
└── README.md
```

### 2. Configure package.json

```json
{
  "name": "@fern-api/generator-migration-{generator}",
  "version": "1.0.0",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "files": ["lib"],
  "dependencies": {
    "@fern-api/configuration": "workspace:*"
  }
}
```

### 3. Implement Migrations

```typescript
import type { MigrationModule } from "@fern-api/migrations-base";

const migrationModule: MigrationModule = {
  migrations: [
    {
      version: "2.0.0",
      migrateGeneratorConfig: ({ config, context }) => {
        context.logger.debug("Applying migration 2.0.0");
        return {
          ...config,
          config: {
            ...(typeof config.config === 'object' ? config.config : {}),
            newField: "default"
          }
        };
      },
      migrateGeneratorsYml: ({ document }) => document
    }
  ]
};

export default migrationModule;
```

### 4. Compile and Publish

```bash
pnpm compile
npm publish
```

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
# Link migration package locally
cd generators/typescript/generator-migration
npm link

# In test project
npm link @fern-api/generator-migration-typescript-sdk

# Run upgrade
cd test-project
fern generator upgrade --generator typescript-sdk
```

## Common Migration Patterns

### Adding a Field

```typescript
migrateGeneratorConfig: (config) => ({
  ...config,
  config: {
    ...(typeof config.config === 'object' ? config.config : {}),
    newField: "default-value"
  }
})
```

### Renaming a Field

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

### Removing a Field

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

### Transforming Values

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

## Best Practices

1. **Pure Functions** - Always return new objects, never mutate
2. **Idempotent** - Safe to run multiple times
3. **Defensive Coding** - Don't assume fields exist
4. **Preserve Unknown Fields** - Use spread operators
5. **Document Intent** - Comment why migrations are needed
6. **Version Alignment** - Migration version matches generator version it upgrades TO
7. **Test Thoroughly** - Test with various configuration shapes

## Future Enhancements

Potential improvements:
- Validation of migration package structure
- Dry-run mode to preview changes
- Migration rollback support
- Batch migration across multiple generators
- Migration verification against generator schema
