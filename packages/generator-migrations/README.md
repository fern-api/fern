# @fern-api/generator-migrations

Unified migration package for all Fern generator configurations.

## Overview

This package contains migrations for all Fern generators, organized by generator name. When users run `fern generator upgrade`, the CLI automatically downloads this package and applies relevant migrations to transform their `generators.yml` configuration.

## Architecture

### Single Unified Package

All generator migrations are consolidated into one npm package:
- **Simpler maintenance**: One package to version and publish
- **Easier discovery**: Single source of truth for all migrations
- **Better for monorepo**: Fits naturally into the Fern monorepo structure
- **Consistent versioning**: All generators migrate together

### Migration Index

Migrations are exported as a record mapping full generator names to migration modules:

```typescript
export const migrations: Record<string, MigrationModule> = {
    "fernapi/fern-typescript": typescriptSdkMigrations,
    "fernapi/fern-typescript-sdk": typescriptSdkMigrations,
    "fernapi/fern-typescript-node-sdk": typescriptSdkMigrations,
    "fernapi/fern-typescript-browser-sdk": typescriptSdkMigrations
};
```

## Usage

This package is consumed by the Fern CLI during generator upgrades. Users don't interact with it directly.

The CLI:
1. Detects a generator version change
2. Downloads `@fern-api/generator-migrations@latest`
3. Looks up migrations by generator name
4. Filters migrations by version range
5. Applies migrations sequentially
6. Writes the transformed config back to `generators.yml`

## Publishing

This package must be published to npm for the CLI to use it. The CLI dynamically installs `@fern-api/generator-migrations@latest` at runtime.

### When to Publish

Publish a new version when:
1. Adding migrations for a new generator
2. Adding new migration versions to existing generators
3. Fixing bugs in existing migrations

### Publishing Steps

```bash
# 1. Update version in package.json
# Follow semver: patch for bug fixes, minor for new migrations, major for breaking changes

# 2. Build the package
pnpm --filter @fern-api/generator-migrations compile

# 3. Test locally (optional but recommended)
cd packages/generator-migrations
npm link
mkdir -p ~/.fern/migration-cache
cd ~/.fern/migration-cache
npm link @fern-api/generator-migrations

# 4. Run tests
pnpm --filter @fern-api/generator-migrations test

# 5. Publish to npm
cd packages/generator-migrations
npm publish --access public

# 6. Clean up local link (if used)
cd ~/.fern/migration-cache
npm unlink --no-save @fern-api/generator-migrations
cd packages/generator-migrations
npm unlink
```

### Version Strategy

- **Patch** (0.1.0 → 0.1.1): Bug fixes in existing migrations
- **Minor** (0.1.0 → 0.2.0): New migration versions added, new generators added
- **Major** (0.1.0 → 1.0.0): Breaking changes to migration API

The package version is independent of generator versions. It simply needs to increment when the package changes.

## Supported Generators

### TypeScript SDK
- `fernapi/fern-typescript`
- `fernapi/fern-typescript-sdk`
- `fernapi/fern-typescript-node-sdk`
- `fernapi/fern-typescript-browser-sdk`

All TypeScript SDK variants share the same migrations.

## Adding Migrations for New Generators

### 1. Create Migration Directory

```bash
mkdir -p src/generators/{language}/migrations
```

### 2. Create Migration Files

```typescript
// src/generators/{language}/migrations/1.0.0.ts
import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

export const migration_1_0_0: Migration = {
    version: "1.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            // Set old defaults for backwards compatibility
            draft.oldField ??= "old-default";
        }),

    migrateGeneratorsYml: ({ document }) => document
};
```

### 3. Create Migration Index

```typescript
// src/generators/{language}/migrations/index.ts
import type { MigrationModule } from "@fern-api/migrations-base";
import { migration_1_0_0 } from "./1.0.0.js";

const migrationModule: MigrationModule = {
    migrations: [migration_1_0_0]
};

export default migrationModule;
```

### 4. Register in Main Index

```typescript
// src/index.ts
import languageMigrations from "./generators/{language}/migrations/index.js";

export const migrations: Record<string, MigrationModule> = {
    // ... existing migrations
    "fernapi/fern-{language}-sdk": languageMigrations
};
```

### 5. Add Tests

Create tests following the structure in `src/__test__/README.md`.

### 6. Compile and Publish

```bash
pnpm compile
npm publish
```

## Migration Patterns

### Setting Defaults (Most Common)

Use the nullish coalescing assignment operator (`??=`) to set values only if undefined:

```typescript
migrateConfig(config, (draft) => {
    draft.field1 ??= false;
    draft.field2 ??= "default-value";
    draft.field3 ??= true;
});
```

### Renaming Fields

```typescript
migrateConfig(config, (draft) => {
    if (draft.oldFieldName !== undefined) {
        draft.newFieldName = draft.oldFieldName;
        delete draft.oldFieldName;
    }
});
```

### Removing Fields

```typescript
migrateConfig(config, (draft) => {
    delete draft.deprecatedField;
});
```

### Conditional Transformations

```typescript
migrateConfig(config, (draft) => {
    if (draft.oldFormat === "legacy") {
        draft.newFormat = { type: "modern", legacy: true };
        delete draft.oldFormat;
    }
});
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Update snapshots
pnpm test:update
```

See [src/__test__/README.md](src/__test__/README.md) for detailed testing documentation.

## Development

### Prerequisites

This package depends on:
- `@fern-api/migrations-base` - Core migration types and utilities

### Building

```bash
# Compile TypeScript
pnpm compile

# Compile with source maps for debugging
pnpm compile:debug

# Clean build artifacts
pnpm clean
```

### Publishing

This package is automatically published when referenced in the Fern CLI's version configuration.

## Migration Best Practices

### 1. Pure Functions
Always return new objects, never mutate input:
```typescript
// ✅ Good - uses migrateConfig helper
migrateConfig(config, (draft) => {
    draft.field = "value";
});

// ❌ Bad - mutates input
config.config.field = "value";
return config;
```

### 2. Idempotent
Migrations should be safe to run multiple times:
```typescript
// ✅ Good - only sets if undefined
draft.field ??= "default";

// ❌ Bad - overwrites existing values
draft.field = "default";
```

### 3. Defensive Coding
Don't assume fields exist:
```typescript
// ✅ Good - checks before accessing
if (draft.nested?.field) {
    draft.nested.field = transform(draft.nested.field);
}

// ❌ Bad - may throw if nested is undefined
draft.nested.field = transform(draft.nested.field);
```

### 4. Preserve Unknown Fields
Use spread operators and Immer's draft pattern:
```typescript
// ✅ Good - Immer preserves unknown fields automatically
migrateConfig(config, (draft) => {
    draft.knownField = "value";
    // unknownField is automatically preserved
});
```

### 5. Document Intent
Explain why migrations are needed:
```typescript
/**
 * Migration for version 2.0.0
 *
 * This release changed the default for `streamType` from "wrapper" to "web"
 * to enable zero-dependency SDKs. For users upgrading from pre-2.0.0,
 * we explicitly set the old default to maintain backwards compatibility.
 *
 * Changed defaults:
 * - streamType: "wrapper" → "web"
 */
```

### 6. Version Alignment
Migration version should match the generator version it upgrades TO:
```typescript
// ✅ Good - migration upgrades TO 2.0.0
export const migration_2_0_0: Migration = {
    version: "2.0.0",
    // ...
};
```

### 7. Test Thoroughly
Write tests for:
- Setting defaults
- Preserving explicit values
- Preserving unknown fields
- Edge cases (null, undefined, invalid types)
- Sequential application
- Immutability

## Related Documentation

- [CLI Migration System](../cli/cli/src/commands/upgrade/migrations/README.md)
- [migrations-base Package](../migrations-base/README.md)
- [TypeScript SDK Migrations Example](src/generators/typescript/migrations/)
- [Test Documentation](src/__test__/README.md)

## Contributing

When adding new migrations:

1. Create migration files following the patterns above
2. Write comprehensive tests
3. Document what changed and why
4. Ensure migrations are idempotent and pure
5. Test with real generator upgrades locally
6. Update this README if adding a new generator

## License

MIT
