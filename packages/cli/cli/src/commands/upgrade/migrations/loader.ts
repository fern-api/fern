import type { generatorsYml } from "@fern-api/configuration";
import type { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { mkdir, readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import semver from "semver";

import { Migration, MigrationModule, MigrationResult } from "./types";

/**
 * The unified migration package name.
 * All generator migrations are in a single package, indexed by full generator name.
 */
const MIGRATION_PACKAGE_NAME = "@fern-api/generator-migrations";

/**
 * Gets the cache directory for migration packages.
 * Migrations are installed to ~/.fern/migration-cache/ to avoid polluting the project.
 *
 * Note: npm's @latest tag resolution ensures we always get the current latest version,
 * and npm's global cache (~/.npm) provides fast installs without repeated downloads.
 */
function getMigrationCacheDir(): string {
    return join(homedir(), ".fern", "migration-cache");
}

/**
 * Loads a migration module for a specific generator.
 * Downloads the unified migration package from npm if not already cached,
 * then imports the specific generator's migrations.
 *
 * @param params - Parameters object
 * @param params.generatorName - The full generator name (e.g., "fernapi/fern-typescript-sdk")
 *                               Must be normalized with fernapi/ prefix before calling this function.
 *                               Use getGeneratorNameOrThrow() or addDefaultDockerOrgIfNotPresent() from
 *                               @fern-api/configuration-loader to normalize.
 * @param params.logger - Logger for user feedback
 * @returns The migration module, or undefined if migrations don't exist for this generator
 *
 * @example
 * ```typescript
 * const module = await loadMigrationModule({
 *   generatorName: "fernapi/fern-typescript-sdk",
 *   logger
 * });
 * if (module) {
 *   console.log(`Found ${module.migrations.length} migrations`);
 * }
 * ```
 */
export async function loadMigrationModule(params: {
    generatorName: string;
    logger: Logger;
}): Promise<MigrationModule | undefined> {
    const { generatorName, logger } = params;
    const cacheDir = getMigrationCacheDir();
    await mkdir(cacheDir, { recursive: true });

    try {
        // Install/update the unified migration package to the cache directory
        // npm will check if @latest is already installed and skip reinstallation if so
        // --ignore-scripts: Security - prevent running arbitrary code during install
        // --no-audit: Skip audit checks for faster installation
        // --no-fund: Skip funding messages
        await loggingExeca(logger, "npm", [
            "install",
            `${MIGRATION_PACKAGE_NAME}@latest`,
            "--prefix",
            cacheDir,
            "--ignore-scripts",
            "--no-audit",
            "--no-fund"
        ]);

        // Read the package.json to get the entry point from the main field
        const packageDir = join(cacheDir, "node_modules", MIGRATION_PACKAGE_NAME);
        const packageJsonPath = join(packageDir, "package.json");
        const packageJsonContent = await readFile(packageJsonPath, "utf-8");
        const packageJson = JSON.parse(packageJsonContent) as { main?: string };

        if (packageJson.main == null) {
            throw new Error(`No main field found in package.json for ${MIGRATION_PACKAGE_NAME}`);
        }

        // Resolve the entry point relative to the package directory
        const packageEntryPoint = join(packageDir, packageJson.main);
        const { migrations } = await import(packageEntryPoint);

        // Look up the migration module directly by generator name
        // Note: generatorName must already be normalized with fernapi/ prefix (done in upgradeGenerator.ts)
        const module = migrations[generatorName];

        if (module == null) {
            // No migrations registered for this generator
            logger.debug(`No migrations registered for generator: ${generatorName}. Continuing without migrations.`);
            return undefined;
        }

        return module;
    } catch (error) {
        // Migration package doesn't exist or failed to install
        // This is expected for generators that don't have migrations yet
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("404") || errorMessage.includes("E404")) {
            logger.info(
                `No migration package found for ${generatorName}. The generator will be upgraded without configuration migrations.`
            );
        } else {
            logger.warn(
                `Failed to load migration package ${MIGRATION_PACKAGE_NAME}: ${errorMessage}. Continuing without migrations.`
            );
        }

        return undefined;
    }
}

/**
 * Filters migrations to those that should be applied for the given version range.
 * Returns migrations where: from < migration.version <= to
 *
 * @param params - Parameters object
 * @param params.migrations - All available migrations
 * @param params.from - The current version (exclusive)
 * @param params.to - The target version (inclusive)
 * @param params.logger - Logger for warning about invalid versions
 * @returns Filtered migrations, sorted by version ascending
 *
 * @example
 * ```typescript
 * const migrations = [
 *   { version: "1.5.0", ... },
 *   { version: "2.0.0", ... },
 *   { version: "2.1.0", ... }
 * ];
 * filterMigrations({ migrations, from: "1.0.0", to: "2.0.0", logger }); // ["1.5.0", "2.0.0"]
 * ```
 */
function filterMigrations(params: { migrations: Migration[]; from: string; to: string; logger: Logger }): Migration[] {
    const { migrations, from, to, logger } = params;
    return migrations
        .filter((migration) => {
            const migrationVersion = semver.parse(migration.version);
            const fromVersion = semver.parse(from);
            const toVersion = semver.parse(to);

            if (migrationVersion == null) {
                logger.warn(`Migration has invalid semver version: ${migration.version}. Skipping this migration.`);
                return false;
            }

            if (fromVersion == null) {
                logger.warn(`Invalid 'from' version: ${from}. Skipping migration ${migration.version}.`);
                return false;
            }

            if (toVersion == null) {
                logger.warn(`Invalid 'to' version: ${to}. Skipping migration ${migration.version}.`);
                return false;
            }

            // Include migrations where: from < version <= to
            return semver.gt(migrationVersion, fromVersion) && semver.lte(migrationVersion, toVersion);
        })
        .sort((a, b) => {
            const aVersion = semver.parse(a.version);
            const bVersion = semver.parse(b.version);

            if (aVersion == null || bVersion == null) {
                return 0;
            }

            return semver.compare(aVersion, bVersion);
        });
}

/**
 * Runs migrations on a generator configuration.
 * Applies migrations sequentially, piping the output of each to the input of the next.
 *
 * @param params - Parameters object
 * @param params.migrations - The migrations to run (should be pre-filtered and sorted)
 * @param params.config - The generator configuration to migrate
 * @param params.logger - Logger for migration feedback
 * @returns The migration result with the updated config and metadata
 *
 * @example
 * ```typescript
 * const result = runMigrations({
 *   migrations: [migration1, migration2],
 *   config: { name: "fern-typescript-sdk", version: "1.0.0", ... },
 *   logger
 * });
 * console.log(`Applied ${result.migrationsApplied} migrations`);
 * ```
 */
export function runMigrations(params: {
    migrations: Migration[];
    config: generatorsYml.GeneratorInvocationSchema;
    logger: Logger;
}): MigrationResult {
    const { migrations, logger } = params;
    let currentConfig = params.config;
    const appliedVersions: string[] = [];

    for (const migration of migrations) {
        // Create a context for this migration with the logger
        const context = {
            logger
        };

        // Apply the migration, creating a new config object
        currentConfig = migration.migrateGeneratorConfig({ config: currentConfig, context });
        appliedVersions.push(migration.version);
    }

    return {
        config: currentConfig,
        migrationsApplied: migrations.length,
        appliedVersions
    };
}

/**
 * Validates that a config object has the minimum required shape for migrations.
 * Checks that the config is an object with a 'name' property.
 *
 * @param config - The config to validate
 * @returns True if the config is valid, false otherwise
 */
function isValidGeneratorConfig(config: unknown): config is generatorsYml.GeneratorInvocationSchema {
    return (
        typeof config === "object" &&
        config != null &&
        "name" in config &&
        typeof (config as { name: unknown }).name === "string"
    );
}

/**
 * Loads and runs migrations for a generator configuration.
 * This is the main entry point for the migration system.
 *
 * @param params - Parameters object
 * @param params.generatorName - The name of the generator
 * @param params.from - The current version
 * @param params.to - The target version
 * @param params.config - The generator configuration to migrate
 * @param params.logger - Logger for migration feedback
 * @returns The migration result, or undefined if no migrations are available
 *
 * @example
 * ```typescript
 * const result = await loadAndRunMigrations({
 *   generatorName: "fernapi/fern-typescript-sdk",
 *   from: "1.0.0",
 *   to: "2.0.0",
 *   config,
 *   logger
 * });
 *
 * if (result) {
 *   console.log(`Applied ${result.migrationsApplied} migrations`);
 *   // Use result.config
 * } else {
 *   // No migrations available, use original config
 * }
 * ```
 */
export async function loadAndRunMigrations(params: {
    generatorName: string;
    from: string;
    to: string;
    config: unknown;
    logger: Logger;
}): Promise<MigrationResult | undefined> {
    const { generatorName, from, to, config, logger } = params;
    // Validate config structure before proceeding
    if (!isValidGeneratorConfig(config)) {
        logger.warn(
            `Invalid generator configuration structure for ${generatorName}. Expected an object with 'name' property. Skipping migrations.`
        );
        return undefined;
    }

    const typedConfig = config;

    // Load the migration module
    const migrationModule = await loadMigrationModule({ generatorName, logger });

    if (migrationModule == null) {
        // No migration package available for this generator
        return undefined;
    }

    // Filter migrations to those in the version range
    const applicableMigrations = filterMigrations({ migrations: migrationModule.migrations, from, to, logger });

    if (applicableMigrations.length === 0) {
        // No migrations need to be applied
        return undefined;
    }

    // Run the migrations
    return runMigrations({ migrations: applicableMigrations, config: typedConfig, logger });
}
