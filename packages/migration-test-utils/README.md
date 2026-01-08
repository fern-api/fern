# @fern-api/migration-test-utils

Testing utilities for Fern generator migrations.

## Overview

This package provides test helpers to make it easier to test generator migration packages. It handles common testing patterns like comparing configurations, testing idempotence, and capturing log messages.

## Installation

```bash
npm install --save-dev @fern-api/migration-test-utils
```

Or in a pnpm workspace:

```json
{
  "devDependencies": {
    "@fern-api/migration-test-utils": "workspace:*"
  }
}
```

## Usage

### Testing a Single Migration

```typescript
import { testMigration } from "@fern-api/migration-test-utils";
import { migration_2_0_0 } from "../migrations/2.0.0";

describe("migration_2_0_0", () => {
  it("should set old defaults for backwards compatibility", () => {
    const result = testMigration({
      migration: migration_2_0_0,
      input: {
        name: "fernapi/fern-typescript-sdk",
        version: "1.0.0",
        config: {}
      },
      expected: {
        name: "fernapi/fern-typescript-sdk",
        version: "1.0.0",
        config: {
          streamType: "wrapper",
          fileResponseType: "stream"
        }
      }
    });

    expect(result.matches).toBe(true);
  });
});
```

### Testing a Migration Chain

Test multiple migrations applied sequentially:

```typescript
import { testMigrationChain } from "@fern-api/migration-test-utils";
import { migration_1_0_0, migration_2_0_0, migration_3_0_0 } from "../migrations";

it("should apply all migrations in sequence", () => {
  const result = testMigrationChain({
    migrations: [migration_1_0_0, migration_2_0_0, migration_3_0_0],
    input: {
      name: "fernapi/fern-typescript-sdk",
      version: "0.9.0",
      config: { customField: "preserved" }
    },
    expected: {
      name: "fernapi/fern-typescript-sdk",
      version: "0.9.0",
      config: {
        // Fields from migration_1_0_0
        inlineFileProperties: false,
        inlinePathParameters: false,
        // Fields from migration_2_0_0
        streamType: "wrapper",
        fileResponseType: "stream",
        // Fields from migration_3_0_0
        packageManager: "yarn",
        // User's field preserved
        customField: "preserved"
      }
    }
  });

  expect(result.matches).toBe(true);
});
```

### Testing Idempotence

Ensure migrations are safe to run multiple times:

```typescript
import { testMigrationIdempotence } from "@fern-api/migration-test-utils";

it("should be idempotent", () => {
  const isIdempotent = testMigrationIdempotence({
    migration: migration_2_0_0,
    input: {
      name: "fernapi/fern-typescript-sdk",
      version: "1.0.0",
      config: {}
    }
  });

  expect(isIdempotent).toBe(true);
});
```

### Testing Unknown Field Preservation

Ensure migrations don't remove unknown fields:

```typescript
import { testMigrationPreservesUnknownFields } from "@fern-api/migration-test-utils";

it("should preserve unknown fields", () => {
  const preserves = testMigrationPreservesUnknownFields({
    migration: migration_2_0_0,
    input: {
      name: "fernapi/fern-typescript-sdk",
      version: "1.0.0",
      config: {
        unknownField: "should-be-kept",
        anotherUnknownField: 42
      }
    }
  });

  expect(preserves).toBe(true);
});
```

### Capturing Log Messages

Test that migrations log appropriate messages:

```typescript
import { createMockLogger, testMigration } from "@fern-api/migration-test-utils";

it("should log when setting defaults", () => {
  const mockLogger = createMockLogger();

  testMigration({
    migration: migration_2_0_0,
    input: { name: "typescript-sdk", version: "1.0.0", config: {} },
    expected: { name: "typescript-sdk", version: "1.0.0", config: { field: "default" } },
    logger: mockLogger.logger
  });

  expect(mockLogger.debugs).toContain("Setting old defaults for backwards compatibility");
});
```

## API Reference

### `testMigration(options)`

Tests a migration against input and expected output.

**Parameters:**
- `migration`: The migration to test
- `input`: Input generator configuration
- `expected`: Expected output configuration
- `logger` (optional): Logger for the migration context

**Returns:** `TestMigrationResult`
- `actual`: The actual output from the migration
- `matches`: Whether the actual matches expected
- `differences` (optional): Array of differences if not matching

### `testMigrationChain(options)`

Tests multiple migrations applied sequentially.

**Parameters:**
- `migrations`: Array of migrations to apply in order
- `input`: Initial generator configuration
- `expected`: Expected final configuration
- `logger` (optional): Logger for migration contexts

**Returns:** `TestMigrationResult`

### `testMigrationIdempotence(options)`

Tests that a migration is idempotent (safe to run multiple times).

**Parameters:**
- `migration`: The migration to test
- `input`: Input generator configuration
- `logger` (optional): Logger for migration contexts

**Returns:** `boolean` - Whether the migration is idempotent

### `testMigrationPreservesUnknownFields(options)`

Tests that a migration preserves unknown fields.

**Parameters:**
- `migration`: The migration to test
- `input`: Input configuration with unknown fields
- `logger` (optional): Logger for migration context

**Returns:** `boolean` - Whether unknown fields were preserved

### `createMockLogger()`

Creates a mock logger that captures log messages.

**Returns:** `MockLogger`
- `logger`: The Logger instance to pass to migrations
- `debugs`: Array of debug messages
- `infos`: Array of info messages
- `warnings`: Array of warning messages
- `errors`: Array of error messages

## Best Practices

### 1. Test All Migration Aspects

For each migration, test:
- ✅ Correctness (input → expected output)
- ✅ Idempotence (safe to run multiple times)
- ✅ Unknown field preservation
- ✅ Explicit value preservation (don't overwrite user config)

### 2. Use Descriptive Test Names

```typescript
// Good
it("should set old default for streamType when upgrading from 1.x to 2.0", () => {

// Bad
it("works", () => {
```

### 3. Test Edge Cases

```typescript
it("should handle missing config object", () => {
  const result = testMigration({
    migration: migration_2_0_0,
    input: { name: "typescript-sdk", version: "1.0.0" }, // No config field
    expected: { name: "typescript-sdk", version: "1.0.0", config: { field: "default" } }
  });
  expect(result.matches).toBe(true);
});

it("should preserve explicitly set values", () => {
  const result = testMigration({
    migration: migration_2_0_0,
    input: {
      name: "typescript-sdk",
      version: "1.0.0",
      config: { streamType: "web" } // User already set this
    },
    expected: {
      name: "typescript-sdk",
      version: "1.0.0",
      config: { streamType: "web" } // Should NOT be overwritten
    }
  });
  expect(result.matches).toBe(true);
});
```

### 4. Test Migration Chains

Always test the full upgrade path:

```typescript
it("should handle upgrading from 0.x to 3.0 with all migrations", () => {
  const result = testMigrationChain({
    migrations: allMigrations, // [1.0.0, 2.0.0, 3.0.0]
    input: { name: "typescript-sdk", version: "0.9.0", config: {} },
    expected: { /* all accumulated defaults */ }
  });
  expect(result.matches).toBe(true);
});
```

## Example Test Suite

See [`/generators/typescript/migrations/src/__test__/migrations.test.ts`](/generators/typescript/migrations/src/__test__/migrations.test.ts) for a complete example using these utilities.

## Related Packages

- [`@fern-api/migrations-base`](../migrations-base) - Base types and utilities for migrations
- [`@fern-api/typescript-sdk-migrations`](../../generators/typescript/migrations) - Example migration package

## License

MIT
