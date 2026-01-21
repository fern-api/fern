/**
 * Re-export types from the migrations-base package.
 * These types are shared between the CLI and all generator migration packages.
 */
export type {
    GeneratorsYmlDocument,
    Migration,
    MigrationModule,
    MigrationResult
} from "@fern-api/migrations-base";
