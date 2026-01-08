import type { generatorsYml } from "@fern-api/configuration";
import type { Logger } from "@fern-api/logger";
import { execSync } from "child_process";
import { mkdirSync } from "fs";
import { rm } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import semver from "semver";

import { Migration, MigrationModule, MigrationResult } from "./types";

/**
 * Map of generator names to their migration package names.
 * This defines which generators have migration packages available.
 *
 * Key: Full generator name (e.g., "fernapi/fern-typescript-sdk")
 * Value: NPM package name for the migration package
 *
 * Generator names come from packages/cli/configuration/src/generators-yml/schemas/GeneratorName.ts
 *
 * When adding a new generator migration package:
 * 1. Create the migration package under generators/{language}/migrations/
 * 2. Uncomment the entry in this map
 * 3. Publish the package to npm as @fern-api/{package-name}
 *
 * Entries are commented out until their migration packages are created and published.
 */
const GENERATOR_MIGRATION_PACKAGES: Record<string, string> = {
    // TypeScript
    "fernapi/fern-typescript": "@fern-api/typescript-sdk-migrations",
    "fernapi/fern-typescript-sdk": "@fern-api/typescript-sdk-migrations",
    "fernapi/fern-typescript-node-sdk": "@fern-api/typescript-sdk-migrations",
    "fernapi/fern-typescript-browser-sdk": "@fern-api/typescript-sdk-migrations",
    "fernapi/fern-typescript-express": "@fern-api/typescript-express-migrations",

    // Python
    "fernapi/fern-python-sdk": "@fern-api/python-sdk-migrations",
    "fernapi/fern-fastapi-server": "@fern-api/fastapi-server-migrations",
    "fernapi/fern-pydantic-model": "@fern-api/pydantic-model-migrations",

    // Java
    "fernapi/fern-java-sdk": "@fern-api/java-sdk-migrations",
    "fernapi/fern-java": "@fern-api/java-migrations",
    "fernapi/java-model": "@fern-api/java-model-migrations",
    "fernapi/fern-java-spring": "@fern-api/java-spring-migrations",

    // Go
    "fernapi/fern-go-sdk": "@fern-api/go-sdk-migrations",
    "fernapi/fern-go-model": "@fern-api/go-model-migrations",
    "fernapi/fern-go-fiber": "@fern-api/go-fiber-migrations",

    // C#
    "fernapi/fern-csharp-sdk": "@fern-api/csharp-sdk-migrations",
    "fernapi/fern-csharp-model": "@fern-api/csharp-model-migrations",

    // Ruby
    "fernapi/fern-ruby-sdk": "@fern-api/ruby-sdk-migrations",
    "fernapi/fern-ruby-model": "@fern-api/ruby-model-migrations",

    // PHP
    "fernapi/fern-php-sdk": "@fern-api/php-sdk-migrations",
    "fernapi/fern-php-model": "@fern-api/php-model-migrations",

    // Rust
    "fernapi/fern-rust-sdk": "@fern-api/rust-sdk-migrations",
    "fernapi/fern-rust-model": "@fern-api/rust-model-migrations",

    // Swift
    "fernapi/fern-swift-sdk": "@fern-api/swift-sdk-migrations",
    "fernapi/fern-swift-model": "@fern-api/swift-model-migrations",

    // OpenAPI/Postman
    "fernapi/fern-openapi": "@fern-api/openapi-migrations",
    "fernapi/fern-stoplight": "@fern-api/stoplight-migrations",
    "fernapi/fern-postman": "@fern-api/postman-migrations",
    "fernapi/openapi-python-client": "@fern-api/openapi-python-client-migrations"
};

/**
 * Gets the cache directory for migration packages.
 * Migrations are installed to ~/.fern/migration-cache/ to avoid polluting the project.
 *
 * Note: We always fetch @latest, so old versions are cleaned up before each install
 * to prevent the cache from growing indefinitely.
 */
function getMigrationCacheDir(): string {
    return join(homedir(), ".fern", "migration-cache");
}

/**
 * Loads a migration module for a specific generator.
 * Downloads the migration package from npm if not already cached.
 *
 * @param generatorName - The full generator name (e.g., "fernapi/fern-typescript-sdk")
 *                        Must be normalized with fernapi/ prefix before calling this function.
 *                        Use getGeneratorNameOrThrow() or addDefaultDockerOrgIfNotPresent() from
 *                        @fern-api/configuration-loader to normalize.
 * @param logger - Logger for user feedback
 * @returns The migration module, or undefined if the package doesn't exist
 *
 * @example
 * ```typescript
 * const module = await loadMigrationModule("fernapi/fern-typescript-sdk", logger);
 * if (module) {
 *   console.log(`Found ${module.migrations.length} migrations`);
 * }
 * ```
 */
export async function loadMigrationModule(generatorName: string, logger: Logger): Promise<MigrationModule | undefined> {
    const cacheDir = getMigrationCacheDir();
    mkdirSync(cacheDir, { recursive: true });

    // Look up the migration package name from the map using the full generator name
    // Note: generatorName must already be normalized with fernapi/ prefix (done in upgradeGenerator.ts)
    const packageName = GENERATOR_MIGRATION_PACKAGES[generatorName];

    if (packageName == null) {
        // No migration package registered for this generator
        logger.debug(`No migration package registered for generator: ${generatorName}`);
        return undefined;
    }

    try {
        const packagePath = join(cacheDir, "node_modules", packageName);

        // Clean up any existing version of this package to ensure we always get @latest
        // and prevent the cache from accumulating old versions
        try {
            await rm(packagePath, { recursive: true, force: true });
        } catch {
            // Ignore errors if the package doesn't exist yet
        }

        // Install the migration package to the cache directory
        // --ignore-scripts: Security - prevent running arbitrary code during install
        // --no-audit: Skip audit checks for faster installation
        // --no-fund: Skip funding messages
        // stdio: "pipe": Suppress npm output
        execSync(`npm install ${packageName}@latest --prefix "${cacheDir}" --ignore-scripts --no-audit --no-fund`, {
            stdio: "pipe"
        });

        // Import the installed module
        const module = (await import(packagePath)) as MigrationModule;

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
                `Failed to load migration package ${packageName}: ${errorMessage}. Continuing without migrations.`
            );
        }

        return undefined;
    }
}

/**
 * Filters migrations to those that should be applied for the given version range.
 * Returns migrations where: from < migration.version <= to
 *
 * @param migrations - All available migrations
 * @param from - The current version (exclusive)
 * @param to - The target version (inclusive)
 * @param logger - Logger for warning about invalid versions
 * @returns Filtered migrations, sorted by version ascending
 *
 * @example
 * ```typescript
 * const migrations = [
 *   { version: "1.5.0", ... },
 *   { version: "2.0.0", ... },
 *   { version: "2.1.0", ... }
 * ];
 * filterMigrations(migrations, "1.0.0", "2.0.0", logger); // ["1.5.0", "2.0.0"]
 * ```
 */
function filterMigrations(migrations: Migration[], from: string, to: string, logger: Logger): Migration[] {
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
 * Loads and runs migrations for a generator configuration.
 * This is the main entry point for the migration system.
 *
 * @param generatorName - The name of the generator
 * @param from - The current version
 * @param to - The target version
 * @param config - The generator configuration to migrate
 * @returns The migration result, or undefined if no migrations are available
 *
 * @example
 * ```typescript
 * const result = await loadAndRunMigrations(
 *   "fernapi/fern-typescript-sdk",
 *   "1.0.0",
 *   "2.0.0",
 *   config
 * );
 *
 * if (result) {
 *   console.log(`Applied ${result.migrationsApplied} migrations`);
 *   // Use result.config
 * } else {
 *   // No migrations available, use original config
 * }
 * ```
 */
export async function loadAndRunMigrations(
    generatorName: string,
    from: string,
    to: string,
    config: unknown,
    logger: Logger
): Promise<MigrationResult | undefined> {
    // Cast to the expected type - we trust that the YAML was parsed correctly
    const typedConfig = config as generatorsYml.GeneratorInvocationSchema;

    // Load the migration module
    const migrationModule = await loadMigrationModule(generatorName, logger);

    if (migrationModule == null) {
        // No migration package available for this generator
        return undefined;
    }

    // Filter migrations to those in the version range
    const applicableMigrations = filterMigrations(migrationModule.migrations, from, to, logger);

    if (applicableMigrations.length === 0) {
        // No migrations need to be applied
        return undefined;
    }

    // Run the migrations
    return runMigrations({ migrations: applicableMigrations, config: typedConfig, logger });
}
