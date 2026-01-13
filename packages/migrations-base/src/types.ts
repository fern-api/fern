import type { generatorsYml } from "@fern-api/configuration";
import type { Logger } from "@fern-api/logger";

/**
 * Represents the raw YAML document structure for generators.yml.
 * This is used for migrations that need to manipulate the entire document.
 */
export interface GeneratorsYmlDocument {
    /**
     * The raw generators configuration schema.
     * This matches the structure of generators.yml files.
     */
    configuration: generatorsYml.GeneratorsConfigurationSchema;
}

/**
 * Context provided to migrations for logging and other utilities.
 */
export interface MigrationContext {
    /**
     * Logger that migrations can use to provide feedback.
     */
    logger: Logger;
}

/**
 * A migration that transforms generator configuration from one version to another.
 * Migrations are run sequentially when upgrading between versions.
 */
export interface Migration {
    /**
     * The version this migration upgrades TO (not from).
     * This should be a valid semver string (e.g., "2.0.0", "1.5.0").
     */
    version: string;

    /**
     * Migrates a single generator configuration.
     * This is called for each generator in generators.yml during an upgrade.
     *
     * @param params - Parameters object
     * @param params.config - The generator configuration to migrate
     * @param params.context - Context for the migration (includes logger and other utilities)
     * @returns A new generator configuration with migrations applied
     *
     * @example
     * ```typescript
     * migrateGeneratorConfig: ({ config, context }) => {
     *   context.logger.debug("Setting old defaults for backwards compatibility");
     *   return {
     *     ...config,
     *     config: {
     *       ...(typeof config.config === 'object' ? config.config : {}),
     *       newField: "default-value"
     *     }
     *   };
     * }
     * ```
     */
    migrateGeneratorConfig: (params: {
        config: generatorsYml.GeneratorInvocationSchema;
        context: MigrationContext;
    }) => generatorsYml.GeneratorInvocationSchema;

    /**
     * Migrates the entire generators.yml document.
     * This is useful for migrations that need to modify top-level configuration
     * or perform transformations across multiple generators.
     *
     * @param params - Parameters object
     * @param params.document - The full generators.yml document
     * @param params.context - Context for the migration (includes logger and other utilities)
     * @returns A new document with migrations applied
     *
     * @example
     * ```typescript
     * migrateGeneratorsYml: ({ document, context }) => {
     *   context.logger.debug("Updating top-level configuration");
     *   return {
     *     configuration: {
     *       ...document.configuration,
     *       newTopLevelField: "value"
     *     }
     *   };
     * }
     * ```
     */
    migrateGeneratorsYml: (params: {
        document: GeneratorsYmlDocument;
        context: MigrationContext;
    }) => GeneratorsYmlDocument;
}

/**
 * A module that exports migrations for a specific generator.
 * This is the interface that migration packages must implement.
 */
export interface MigrationModule {
    /**
     * Array of migrations for this generator, ordered by version.
     * Migrations will be filtered and sorted by the CLI before execution.
     */
    migrations: Migration[];
}

/**
 * Result of applying migrations to a generator configuration.
 */
export interface MigrationResult {
    /**
     * The migrated generator configuration.
     */
    config: generatorsYml.GeneratorInvocationSchema;

    /**
     * The number of migrations that were applied.
     */
    migrationsApplied: number;

    /**
     * The versions of migrations that were applied, in order.
     */
    appliedVersions: string[];
}
