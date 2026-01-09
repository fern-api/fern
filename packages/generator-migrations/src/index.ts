/**
 * @fern-api/generator-migrations
 *
 * Unified migration package for all Fern generator configurations.
 *
 * This package contains migrations for all generators, organized by generator name.
 */

import type { MigrationModule } from "@fern-api/migrations-base";
import typescriptSdkMigrations from "./generators/typescript/migrations/index.js";

/**
 * All generator migrations indexed by full generator name.
 *
 * When adding migrations for a new generator:
 * 1. Add migrations under src/generators/{language}/migrations/
 * 2. Import the migration module
 * 3. Add entries for all generator name variants
 */
export const migrations: Record<string, MigrationModule> = {
    // TypeScript SDK - all variants share the same migrations
    "fernapi/fern-typescript": typescriptSdkMigrations,
    "fernapi/fern-typescript-sdk": typescriptSdkMigrations,
    "fernapi/fern-typescript-node-sdk": typescriptSdkMigrations,
    "fernapi/fern-typescript-browser-sdk": typescriptSdkMigrations
};
