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
} from "./types";
export { applyDefaults, createMigratedConfig, getConfigObject, setIfUndefined } from "./utils";
