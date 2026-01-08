import type { MigrationModule } from "@fern-api/migrations-base";

import { migration_1_0_0, migration_2_0_0, migration_3_0_0 } from "./migrations";

/**
 * Migration package for TypeScript SDK generator.
 *
 * This package contains migrations for generator configuration changes.
 * Each migration transforms the configuration from one version to another.
 *
 * Migrations are automatically applied by the Fern CLI when running:
 * `fern generator upgrade --generator typescript-sdk`
 *
 * ## Structure
 *
 * Each migration is defined in a separate file under `./migrations/`:
 * - `1.0.0.ts` - Migration for version 1.0.0
 * - `2.0.0.ts` - Migration for version 2.0.0
 * - `3.0.0.ts` - Migration for version 3.0.0
 *
 * ## Adding New Migrations
 *
 * When adding a new migration:
 * 1. Create a new file `./migrations/{version}.ts`
 * 2. Export the migration constant (e.g., `migration_4_0_0`)
 * 3. Import and add it to the `migrations` array below
 * 4. Document what changed in the migration file comments
 *
 * ## Migration Guidelines
 *
 * - Use the version the migration upgrades TO (not FROM)
 * - Preserve old defaults for backwards compatibility
 * - Only set defaults if fields are not already explicitly configured
 * - Keep migrations idempotent (safe to run multiple times)
 * - Test with various configuration shapes
 */

/**
 * Export all migrations in an array, ordered by version.
 *
 * The CLI will:
 * 1. Filter to migrations in the version range (from < version <= to)
 * 2. Sort by version ascending
 * 3. Apply sequentially
 */
const migrationModule: MigrationModule = {
    migrations: [migration_1_0_0, migration_2_0_0, migration_3_0_0]
};

export default migrationModule;
