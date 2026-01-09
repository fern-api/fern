/**
 * @fern-api/migrations-base
 *
 * Base types and utilities for Fern generator migrations.
 *
 * This package provides common functionality that can be shared across
 * all generator migration packages.
 */

export type {
    GeneratorsYmlDocument,
    Migration,
    MigrationContext,
    MigrationModule,
    MigrationResult
} from "./types.js";
export { migrateConfig } from "./utils.js";
