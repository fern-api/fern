import type { generatorsYml } from "@fern-api/configuration";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import type { Migration, MigrationModule, MigratorResult } from "@fern-api/migrations-base";
import { readFileSync, unlinkSync } from "fs";
import { mkdir, open, readFile, stat, unlink } from "fs/promises";
import { join } from "path";
import semver from "semver";
import { pathToFileURL } from "url";
import type { FernYmlEditor } from "../../config/fern-yml/FernYmlEditor.js";
import type { Target } from "../config/Target.js";

/** The unified npm package containing all generator migrations. */
const MIGRATION_PACKAGE_NAME = "@fern-api/generator-migrations";

export namespace GeneratorMigrator {
    export interface Config {
        /** Logger for migration feedback and debug output. */
        logger: Logger;
        /** Cache directory for downloading migration packages (e.g. ~/.cache/fern/v1/migrations). */
        cachePath: AbsoluteFilePath;
    }

    /** Result returned after running migrations for a single target. */
    export interface MigrationInfo {
        /** Number of migrations that were applied. */
        migrationsApplied: number;
        /** The version strings of applied migrations, in order. */
        appliedVersions: string[];
    }
}

/**
 * Adapts SDK targets to the legacy GeneratorInvocationSchema format
 * and runs generator config migrations when upgrading versions.
 *
 * Migrations transform generator-specific config (the `config` field on a
 * target) to match the expectations of a newer generator version. For
 * example, a 2.0.0 migration might set config keys to preserve backwards
 * compatibility.
 */
export class GeneratorMigrator {
    private readonly logger: Logger;
    private readonly cachePath: AbsoluteFilePath;

    /**
     * Instance-level promise that ensures the migration package is installed
     * only once per GeneratorMigrator instance. Subsequent calls to
     * loadMigrationModule reuse the cached result instead of re-running
     * npm install.
     */
    private migrationsInstallPromise: Promise<Record<string, MigrationModule> | undefined> | undefined;

    private static readonly LOCK_FILENAME = ".install.lock";
    private static readonly LOCK_POLL_MS = 200;
    private static readonly LOCK_STALE_MS = 5 * 60 * 1000; // 5 minutes

    constructor(config: GeneratorMigrator.Config) {
        this.logger = config.logger;
        this.cachePath = config.cachePath;
    }

    /**
     * Runs applicable migrations for a target version upgrade and applies
     * the resulting config changes to the editor.
     *
     * Returns migration metadata on success, or undefined if no migrations
     * were applicable.
     */
    public async migrate({
        target,
        editor,
        from,
        to
    }: {
        target: Target;
        editor: FernYmlEditor;
        from: string;
        to: string;
    }): Promise<GeneratorMigrator.MigrationInfo | undefined> {
        const invocationSchema = this.toGeneratorInvocationSchema(target);

        const result = await this.loadAndRunMigrations({
            generatorName: target.image,
            from,
            to,
            config: invocationSchema
        });

        if (result == null) {
            return undefined;
        }

        this.applyConfigChanges({ target, editor, migratedConfig: result.config.config });

        return {
            migrationsApplied: result.migrationsApplied,
            appliedVersions: result.appliedVersions
        };
    }

    /**
     * Maps an SDK target to the legacy GeneratorInvocationSchema that the
     * migration system expects.
     */
    private toGeneratorInvocationSchema(target: Target): generatorsYml.GeneratorInvocationSchema {
        return {
            name: target.image,
            version: target.version,
            config: target.config
        };
    }

    /**
     * Applies the migrated `config` field back to the YAML document via
     * the editor. If the migration removed config entirely, the key is
     * deleted from the target.
     */
    private applyConfigChanges({
        target,
        editor,
        migratedConfig
    }: {
        target: Target;
        editor: FernYmlEditor;
        migratedConfig: unknown;
    }): void {
        if (migratedConfig != null && typeof migratedConfig === "object") {
            editor.setTargetConfig(target.name, migratedConfig as Record<string, unknown>);
            return;
        }
        if (target.config != null && migratedConfig == null) {
            editor.deleteTargetConfig(target.name);
        }
    }

    /**
     * Downloads the migration package from npm, filters applicable migrations
     * for the version range (from, to], and applies them sequentially.
     */
    private async loadAndRunMigrations({
        generatorName,
        from,
        to,
        config
    }: {
        generatorName: string;
        from: string;
        to: string;
        config: generatorsYml.GeneratorInvocationSchema;
    }): Promise<MigratorResult | undefined> {
        const migrationModule = await this.loadMigrationModule(generatorName);
        if (migrationModule == null) {
            return undefined;
        }

        const applicableMigrations = this.filterMigrations({
            migrations: migrationModule.migrations,
            from,
            to
        });

        if (applicableMigrations.length === 0) {
            return undefined;
        }

        return this.runMigrations({ migrations: applicableMigrations, config });
    }

    /**
     * Installs the migration package once and returns the full migrations map.
     *
     * Within a single instance, concurrent calls reuse the same in-flight promise.
     * Across processes, a file lock serializes npm installs so only one process
     * writes to the shared --prefix directory at a time. Processes that acquire
     * the lock after another process has already installed the package will find
     * it already present and skip the npm install entirely.
     */
    private async ensureMigrationsInstalled(): Promise<Record<string, MigrationModule> | undefined> {
        if (this.migrationsInstallPromise != null) {
            return this.migrationsInstallPromise.catch((err) => {
                this.migrationsInstallPromise = undefined;
                throw err;
            });
        }

        this.migrationsInstallPromise = (async () => {
            const cacheDir = this.cachePath as string;
            await mkdir(cacheDir, { recursive: true });

            const npmCacheDir = join(cacheDir, ".npm-cache");
            const packageDir = join(cacheDir, "node_modules", MIGRATION_PACKAGE_NAME);
            const packageJsonPath = join(packageDir, "package.json");

            // Acquire cross-process lock so only one process runs npm install
            // at a time. We always run `npm install @latest` (npm handles
            // version freshness); the lock prevents concurrent installs from
            // corrupting each other's node_modules.
            const releaseLock = await GeneratorMigrator.acquireLock(this.logger, cacheDir);
            try {
                await loggingExeca(
                    this.logger,
                    "npm",
                    [
                        "install",
                        `${MIGRATION_PACKAGE_NAME}@latest`,
                        "--prefix",
                        cacheDir,
                        "--cache",
                        npmCacheDir,
                        "--ignore-scripts",
                        "--no-audit",
                        "--no-fund"
                    ],
                    { doNotPipeOutput: true }
                );

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
        this.migrationsInstallPromise.catch(() => {
            this.migrationsInstallPromise = undefined;
        });

        return this.migrationsInstallPromise;
    }

    /**
     * Returns true if the given PID belongs to a currently running process.
     */
    private static isProcessAlive(pid: number): boolean {
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
     */
    private static async acquireLock(logger: Logger, cacheDir: string): Promise<() => Promise<void>> {
        const lockPath = join(cacheDir, GeneratorMigrator.LOCK_FILENAME);
        const myPid = String(process.pid);

        // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
        while (true) {
            try {
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
                    throw err;
                }

                // Lock file exists — check if it's stale
                try {
                    const lockContent = await readFile(lockPath, "utf-8");
                    const lockPid = Number(lockContent.trim());
                    const lockStat = await stat(lockPath);
                    const lockAge = Date.now() - lockStat.mtimeMs;

                    if (
                        lockAge > GeneratorMigrator.LOCK_STALE_MS ||
                        (Number.isFinite(lockPid) && lockPid > 0 && !GeneratorMigrator.isProcessAlive(lockPid))
                    ) {
                        logger.debug(`Removing stale migration lock (pid=${lockContent.trim()}, age=${lockAge}ms)`);
                        try {
                            await unlink(lockPath);
                        } catch (unlinkErr: unknown) {
                            // Another process may have removed it
                            logger.debug(`Failed to remove stale lock: ${unlinkErr}`);
                        }
                        continue;
                    }
                } catch (vanishErr: unknown) {
                    // Lock file vanished — retry immediately
                    logger.debug(`Lock file vanished during stale check: ${vanishErr}`);
                    continue;
                }

                await new Promise((resolve) => setTimeout(resolve, GeneratorMigrator.LOCK_POLL_MS));
            }
        }
    }

    /**
     * Loads the migration module for a specific generator from the cached
     * migrations map. The underlying npm install is only performed once.
     */
    private async loadMigrationModule(generatorName: string): Promise<MigrationModule | undefined> {
        try {
            const migrationsMap = await this.ensureMigrationsInstalled();
            if (migrationsMap == null) {
                return undefined;
            }

            const module = migrationsMap[generatorName] as MigrationModule | undefined;
            if (module == null) {
                this.logger.debug(`No migrations registered for generator: ${generatorName}.`);
                return undefined;
            }

            return module;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes("404") || errorMessage.includes("E404")) {
                this.logger.debug(`No migration package found for ${generatorName}.`);
                return undefined;
            }

            throw new Error(
                `Failed to load generator migrations for ${generatorName}.\n\n` +
                    `Reason: ${errorMessage}\n\n` +
                    `Please check your internet connection and npm configuration, then try again.`
            );
        }
    }

    /**
     * Filters migrations to those applicable for the given version range.
     * Returns migrations where: from < migration.version <= to
     */
    private filterMigrations({
        migrations,
        from,
        to
    }: {
        migrations: Migration[];
        from: string;
        to: string;
    }): Migration[] {
        return migrations
            .filter((migration) => {
                const migrationVersion = semver.parse(migration.version);
                const fromVersion = semver.parse(from);
                const toVersion = semver.parse(to);

                if (migrationVersion == null) {
                    this.logger.warn(`Migration has invalid semver version: ${migration.version}. Skipping.`);
                    return false;
                }
                if (fromVersion == null) {
                    this.logger.warn(`Invalid 'from' version: ${from}. Skipping migration ${migration.version}.`);
                    return false;
                }
                if (toVersion == null) {
                    this.logger.warn(`Invalid 'to' version: ${to}. Skipping migration ${migration.version}.`);
                    return false;
                }

                return semver.gt(migrationVersion, fromVersion) && semver.lte(migrationVersion, toVersion);
            })
            .sort((a, b) => {
                const aVersion = semver.parse(a.version);
                const bVersion = semver.parse(b.version);

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

    /** Runs a list of migrations sequentially on a generator config. */
    private runMigrations({
        migrations,
        config
    }: {
        migrations: Migration[];
        config: generatorsYml.GeneratorInvocationSchema;
    }): MigratorResult {
        let currentConfig = config;
        const appliedVersions: string[] = [];

        for (const migration of migrations) {
            try {
                currentConfig = migration.migrateGeneratorConfig({
                    config: currentConfig,
                    context: { logger: this.logger }
                });
                appliedVersions.push(migration.version);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                throw new Error(
                    `Failed to apply migration for version ${migration.version}.\n\n` +
                        `Reason: ${errorMessage}\n\n` +
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
}
