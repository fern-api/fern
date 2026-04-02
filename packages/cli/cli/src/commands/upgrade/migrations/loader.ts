import type { generatorsYml } from "@fern-api/configuration";
import { extractErrorMessage } from "@fern-api/core-utils";
import type { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { readFileSync, unlinkSync } from "fs";
import { mkdir, open, readFile, stat, unlink } from "fs/promises";
import { homedir } from "os";
import { join } from "path";
import semver from "semver";
import { pathToFileURL } from "url";
import { Migration, MigrationModule, MigratorResult } from "./types.js";

/**
 * The unified migration package name.
 * All generator migrations are in a single package, indexed by full generator name.
 */
const MIGRATION_PACKAGE_NAME = "@fern-api/generator-migrations";

/**
 * Gets the cache directory for migration packages.
 * Migrations are installed to ~/.fern/migration-cache/ to avoid polluting the project.
 */
function getMigrationCacheDir(): string {
    return join(homedir(), ".fern", "migration-cache");
}

// ---------------------------------------------------------------------------
// Cross-process file lock
// ---------------------------------------------------------------------------

const LOCK_FILENAME = ".install.lock";
const LOCK_POLL_MS = 200;
const LOCK_STALE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Returns true if the given PID belongs to a currently running process.
 */
function isProcessAlive(pid: number): boolean {
    try {
        process.kill(pid, 0);
        return true;
    } catch (e: unknown) {
        // EPERM means the process exists but we lack permission to signal it
        if ((e as NodeJS.ErrnoException).code === "EPERM") {
            return true;
        }
        return false;
    }
}

/**
 * Acquires an exclusive file lock by atomically creating a lock file.
 * If the lock already exists, polls until it becomes available.
 * Stale locks (from dead processes or older than LOCK_STALE_MS) are
 * automatically removed.
 *
 * Returns a release function that MUST be called when done.
 */
async function acquireLock(logger: Logger, cacheDir: string): Promise<() => Promise<void>> {
    const lockPath = join(cacheDir, LOCK_FILENAME);
    const myPid = String(process.pid);

    // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
    while (true) {
        try {
            // O_CREAT | O_EXCL — fails if file already exists (atomic)
            const fh = await open(lockPath, "wx");
            await fh.writeFile(myPid);
            await fh.close();

            // Register a synchronous exit handler so the lock is cleaned up
            // even if the process crashes or is killed (SIGTERM/SIGINT).
            const exitHandler = (): void => {
                try {
                    const content = readFileSync(lockPath, "utf-8");
                    if (content.trim() === myPid) {
                        unlinkSync(lockPath);
                    }
                } catch (e: unknown) {
                    // Lock file already removed or unreadable — best-effort cleanup
                    void e; // Intentionally suppressed: exit handler cannot log asynchronously
                }
            };
            process.on("exit", exitHandler);

            return async () => {
                process.removeListener("exit", exitHandler);
                try {
                    // Verify we still own the lock before removing it.
                    // If the lock was stolen (stale-lock takeover), skip the unlink
                    // so we don't delete another process's lock.
                    const currentContent = await readFile(lockPath, "utf-8");
                    if (currentContent.trim() === myPid) {
                        await unlink(lockPath);
                    } else {
                        logger.debug(
                            `Lock file owned by another process (expected pid=${myPid}, found=${currentContent.trim()}); skipping release`
                        );
                    }
                } catch (err: unknown) {
                    logger.debug(`Failed to release migration lock: ${err}`);
                }
            };
        } catch (err: unknown) {
            const code = (err as NodeJS.ErrnoException).code;
            if (code !== "EEXIST") {
                // Unexpected error (permissions, disk full, etc.) — let it propagate
                throw err;
            }

            // Lock file exists — check if it's stale
            try {
                const lockContent = await readFile(lockPath, "utf-8");
                const lockPid = Number(lockContent.trim());
                const lockStat = await stat(lockPath);
                const lockAge = Date.now() - lockStat.mtimeMs;

                if (lockAge > LOCK_STALE_MS || (Number.isFinite(lockPid) && lockPid > 0 && !isProcessAlive(lockPid))) {
                    // Stale lock — remove it and retry immediately
                    logger.debug(`Removing stale migration lock (pid=${lockContent.trim()}, age=${lockAge}ms)`);
                    try {
                        await unlink(lockPath);
                    } catch (unlinkErr: unknown) {
                        // Another process may have removed it — that's fine
                        logger.debug(`Failed to remove stale lock: ${unlinkErr}`);
                    }
                    continue;
                }
            } catch (vanishErr: unknown) {
                // Lock file vanished between open and stat — retry immediately
                logger.debug(`Lock file vanished during stale check: ${vanishErr}`);
                continue;
            }

            // Lock is held by a live process — wait and retry
            await new Promise((resolve) => setTimeout(resolve, LOCK_POLL_MS));
        }
    }
}

/**
 * Module-level promise that ensures the migration package is installed only once
 * per CLI process. When multiple workspaces are upgraded concurrently via
 * Promise.all, they all await this single promise instead of racing on
 * concurrent npm installs to the same --prefix directory (which causes
 * TAR_ENTRY_ERROR and missing files).
 */
let migrationsInstallPromise: Promise<Record<string, MigrationModule> | undefined> | undefined;

/**
 * Installs the migration package once and returns the full migrations map.
 *
 * Within a single process, concurrent calls reuse the same in-flight promise.
 * Across processes, a file lock serializes npm installs so only one process
 * writes to the shared --prefix directory at a time. Processes that acquire
 * the lock after another process has already installed the package will find
 * it already present and skip the npm install entirely.
 */
async function ensureMigrationsInstalled(logger: Logger): Promise<Record<string, MigrationModule> | undefined> {
    if (migrationsInstallPromise != null) {
        return migrationsInstallPromise.catch((err) => {
            migrationsInstallPromise = undefined;
            throw err;
        });
    }

    migrationsInstallPromise = (async () => {
        const cacheDir = getMigrationCacheDir();
        await mkdir(cacheDir, { recursive: true });

        const npmCacheDir = join(cacheDir, ".npm-cache");
        const packageDir = join(cacheDir, "node_modules", MIGRATION_PACKAGE_NAME);
        const packageJsonPath = join(packageDir, "package.json");

        // Acquire cross-process lock so only one process runs npm install at a time.
        // We always run `npm install @latest` (npm handles version freshness via
        // registry checks); the lock simply prevents concurrent installs from
        // corrupting each other's node_modules.
        const releaseLock = await acquireLock(logger, cacheDir);
        try {
            await loggingExeca(logger, "npm", [
                "install",
                `${MIGRATION_PACKAGE_NAME}@latest`,
                "--prefix",
                cacheDir,
                "--cache",
                npmCacheDir,
                "--ignore-scripts",
                "--no-audit",
                "--no-fund"
            ]);

            // Read & import while the lock is held so another process cannot
            // start a concurrent npm install that overwrites node_modules.
            const packageJsonContent = await readFile(packageJsonPath, "utf-8");
            const packageJson = JSON.parse(packageJsonContent) as { main?: string };

            if (packageJson.main == null) {
                throw new Error(`No main field found in package.json for ${MIGRATION_PACKAGE_NAME}`);
            }

            const packageEntryPoint = join(packageDir, packageJson.main);
            const { migrations } = await import(pathToFileURL(packageEntryPoint).href);
            return migrations as Record<string, MigrationModule>;
        } finally {
            await releaseLock();
        }
    })();

    // Reset the cached promise on failure so the next call can retry.
    migrationsInstallPromise.catch(() => {
        migrationsInstallPromise = undefined;
    });

    return migrationsInstallPromise;
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

    try {
        const migrationsMap = await ensureMigrationsInstalled(logger);
        if (migrationsMap == null) {
            return undefined;
        }

        // Look up the migration module directly by generator name
        // Note: generatorName must already be normalized with fernapi/ prefix (done in upgradeGenerator.ts)
        const module = migrationsMap[generatorName];

        if (module == null) {
            // No migrations registered for this generator
            logger.debug(`No migrations registered for generator: ${generatorName}. Continuing without migrations.`);
            return undefined;
        }

        return module;
    } catch (error) {
        // Migration package doesn't exist or failed to install
        const errorMessage = extractErrorMessage(error);

        // 404 errors mean the migration package doesn't exist yet - this is expected
        // for generators that don't have migrations
        if (errorMessage.includes("404") || errorMessage.includes("E404")) {
            logger.debug(
                `No migration package found for ${generatorName}. The generator will be upgraded without configuration migrations.`
            );
            return undefined;
        }

        // Any other error indicates a problem loading migrations that should halt the upgrade
        const userFriendlyError = new Error(
            `Failed to load generator migrations for ${generatorName}.\n\n` +
                `Reason: ${errorMessage}\n\n` +
                `This error occurred while trying to install the migration package (${MIGRATION_PACKAGE_NAME}). ` +
                `Please check your internet connection and npm configuration, then try again.\n\n` +
                `If the problem persists, you can:\n` +
                `  1. Check if npm is working: npm --version\n` +
                `  2. Clear the migration cache: rm -rf ~/.fern/migration-cache\n` +
                `  3. Try the upgrade again: fern generator upgrade`
        );
        throw userFriendlyError;
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

            // After filtering, all versions should be valid. This is a sanity check.
            if (aVersion == null || bVersion == null) {
                throw new Error(
                    `Internal error: Invalid migration version found during sort. ` +
                        `Version A: ${a.version}, Version B: ${b.version}. ` +
                        `This should not happen as invalid versions are filtered out.`
                );
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
}): MigratorResult {
    const { migrations, logger } = params;
    let currentConfig = params.config;
    const appliedVersions: string[] = [];

    for (const migration of migrations) {
        try {
            // Create a context for this migration with the logger
            const context = {
                logger
            };

            // Apply the migration, creating a new config object
            currentConfig = migration.migrateGeneratorConfig({ config: currentConfig, context });
            appliedVersions.push(migration.version);
        } catch (error) {
            const errorMessage = extractErrorMessage(error);
            throw new Error(
                `Failed to apply migration for version ${migration.version}.\n\n` +
                    `Reason: ${errorMessage}\n\n` +
                    `This migration was attempting to update your generator configuration. ` +
                    `The upgrade has been halted to prevent partial or invalid changes.\n\n` +
                    `Please report this issue at: https://github.com/fern-api/fern/issues`
            );
        }
    }

    return {
        config: currentConfig,
        migrationsApplied: migrations.length,
        appliedVersions
    };
}

/**
 * Validates that a config object has the minimum required shape for migrations.
 * Accepts either a DefaultGeneratorInvocationSchema (has string `name`) or a
 * CustomGeneratorInvocationSchema (has non-null object `image`).
 *
 * @param config - The config to validate
 * @returns True if the config is valid, false otherwise
 */
function isValidGeneratorConfig(config: unknown): config is generatorsYml.GeneratorInvocationSchema {
    if (typeof config !== "object" || config == null) {
        return false;
    }

    // DefaultGeneratorInvocationSchema — identified by a string `name` field
    const hasValidName = "name" in config && typeof config.name === "string";

    // CustomGeneratorInvocationSchema — identified by a non-null object `image` field
    // Note: `typeof null === "object"` in JS, so the explicit null check is required.
    const hasValidImage = "image" in config && config.image != null && typeof config.image === "object";

    return hasValidName || hasValidImage;
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
}): Promise<MigratorResult | undefined> {
    const { generatorName, from, to, config, logger } = params;
    // Validate config structure before proceeding
    if (!isValidGeneratorConfig(config)) {
        throw new Error(
            `Invalid generator configuration for ${generatorName}.\n\n` +
                `The generator configuration must be an object with either a 'name' property or an 'image' property, ` +
                `but the current configuration does not match this structure. This may indicate a malformed generators.yml file.\n\n` +
                `Please check your generators.yml file and ensure the generator is properly configured.`
        );
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
