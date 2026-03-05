import type { generatorsYml } from "@fern-api/configuration";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import type { Migration, MigrationModule, MigratorResult } from "@fern-api/migrations-base";
import { mkdir, readFile } from "fs/promises";
import { join } from "path";
import semver from "semver";
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
     * Uses an isolated npm cache to avoid corruption from the system npm cache.
     *
     * Subsequent calls reuse the cached result, avoiding redundant npm installs
     * when migrating multiple generators in the same session.
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

            // Use an isolated npm cache inside the migration cache dir to prevent
            // corrupt system-level npm cache entries from causing repeated failures.
            const npmCacheDir = join(cacheDir, ".npm-cache");
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

            const packageDir = join(cacheDir, "node_modules", MIGRATION_PACKAGE_NAME);
            const packageJsonPath = join(packageDir, "package.json");
            const packageJsonContent = await readFile(packageJsonPath, "utf-8");
            const packageJson = JSON.parse(packageJsonContent) as { main?: string };

            if (packageJson.main == null) {
                throw new Error(`No main field found in package.json for ${MIGRATION_PACKAGE_NAME}`);
            }

            const packageEntryPoint = join(packageDir, packageJson.main);
            const { migrations } = await import(packageEntryPoint);
            return migrations as Record<string, MigrationModule>;
        })();

        // Reset the cached promise on failure so the next call can retry.
        this.migrationsInstallPromise.catch(() => {
            this.migrationsInstallPromise = undefined;
        });

        return this.migrationsInstallPromise;
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
