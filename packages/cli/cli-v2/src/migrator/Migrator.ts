import type { schemas } from "@fern-api/config";
import { APIS_DIRECTORY, FERN_DIRECTORY, type generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { Logger } from "@fern-api/logger";
import { readdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { convertMultiApi, convertSingleApi } from "./converters/index.js";
import { FernConfigJsonMigrator } from "./fern-config-json/index.js";
import { GeneratorsYmlMigrator } from "./generators-yml/index.js";
import type { MigratorResult, MigratorWarning } from "./types/index.js";

const FERN_YML_FILENAME = "fern.yml";

export interface MigratorConfig {
    cwd: AbsoluteFilePath;
    logger: Logger;
    deleteOriginals?: boolean;
}

export class Migrator {
    private readonly cwd: AbsoluteFilePath;
    private readonly logger: Logger;
    private readonly deleteOriginals: boolean;

    constructor(config: MigratorConfig) {
        this.cwd = config.cwd;
        this.logger = config.logger;
        this.deleteOriginals = config.deleteOriginals ?? true;
    }

    /**
     * Performs the full migration from legacy configuration files to fern.yml.
     */
    public async migrate(): Promise<MigratorResult> {
        const warnings: MigratorWarning[] = [];
        const migratedFiles: AbsoluteFilePath[] = [];

        const fernDir = await this.findFernDirectory();
        if (fernDir == null) {
            return {
                success: false,
                warnings: [
                    {
                        type: "conflict",
                        message: "Could not find fern directory",
                        suggestion: "Run this command from a directory containing a 'fern' folder"
                    }
                ],
                migratedFiles
            };
        }

        const projectConfigMigrator = new FernConfigJsonMigrator({ cwd: fernDir });
        const projectConfigResult = await projectConfigMigrator.migrate();
        warnings.push(...projectConfigResult.warnings);

        if (!projectConfigResult.success || projectConfigResult.org == null) {
            return {
                success: false,
                warnings: [
                    ...warnings,
                    {
                        type: "conflict",
                        message: "Failed to migrate fern.config.json - organization is required"
                    }
                ],
                migratedFiles
            };
        }

        if (projectConfigResult.absoluteFilePath != null) {
            migratedFiles.push(projectConfigResult.absoluteFilePath);
        }

        const apisDir = join(fernDir, RelativeFilePath.of(APIS_DIRECTORY));
        const isMultiApi = await doesPathExist(apisDir, "directory");

        let fernYml: schemas.FernYmlSchema;
        if (isMultiApi) {
            const multiApiResult = await this.migrateMultiApi({
                fernDir,
                apisDir,
                org: projectConfigResult.org,
                warnings,
                migratedFiles
            });

            if (!multiApiResult.success) {
                return {
                    success: false,
                    warnings,
                    migratedFiles
                };
            }

            fernYml = multiApiResult.fernYml;
        } else {
            const singleApiResult = await this.migrateSingleApi({
                fernDir,
                org: projectConfigResult.org,
                warnings,
                migratedFiles
            });

            if (!singleApiResult.success) {
                return {
                    success: false,
                    warnings,
                    migratedFiles
                };
            }

            fernYml = singleApiResult.fernYml;
        }

        // Write fern.yml in the current working directory.
        const fernYmlPath = join(this.cwd, RelativeFilePath.of(FERN_YML_FILENAME));
        const yamlContent = this.serializeFernYml(fernYml);
        await writeFile(fernYmlPath, yamlContent, "utf-8");

        if (this.deleteOriginals) {
            for (const absoluteFilePath of migratedFiles) {
                try {
                    await rm(absoluteFilePath);
                    this.logger.debug(`Deleted ${absoluteFilePath}`);
                } catch {
                    warnings.push({
                        type: "info",
                        message: `Could not delete ${absoluteFilePath}`
                    });
                }
            }
        }

        this.logger.info(`Created ${fernYmlPath}`);

        return {
            success: true,
            warnings,
            migratedFiles,
            outputPath: fernYmlPath
        };
    }

    private async migrateSingleApi(options: {
        fernDir: AbsoluteFilePath;
        org: string;
        warnings: MigratorWarning[];
        migratedFiles: AbsoluteFilePath[];
    }): Promise<{ success: boolean; fernYml: schemas.FernYmlSchema }> {
        const { fernDir, org, warnings, migratedFiles } = options;

        const generatorsMigrator = new GeneratorsYmlMigrator({ cwd: fernDir });
        const generatorsResult = await generatorsMigrator.migrate();
        warnings.push(...generatorsResult.warnings);

        if (generatorsResult.absoluteFilePath != null) {
            migratedFiles.push(generatorsResult.absoluteFilePath);
        }

        const apiResult = await convertSingleApi({
            fernDir,
            generatorsYmlApi: generatorsResult.rawApi
        });
        warnings.push(...apiResult.warnings);

        const fernYml: schemas.FernYmlSchema = {
            org
        };

        if (apiResult.api != null) {
            fernYml.api = apiResult.api;
        }
        if (generatorsResult.sdks != null) {
            fernYml.sdks = generatorsResult.sdks;
        }

        return { success: true, fernYml };
    }

    private async migrateMultiApi(options: {
        fernDir: AbsoluteFilePath;
        apisDir: AbsoluteFilePath;
        org: string;
        warnings: MigratorWarning[];
        migratedFiles: AbsoluteFilePath[];
    }): Promise<{ success: boolean; fernYml: schemas.FernYmlSchema }> {
        const { fernDir, apisDir, org, warnings, migratedFiles } = options;

        const apiDirs = await readdir(apisDir, { withFileTypes: true });
        const apiNames = apiDirs.filter((d) => d.isDirectory()).map((d) => d.name);
        if (apiNames.length === 0) {
            warnings.push({
                type: "conflict",
                message: "No API directories found in fern/apis/"
            });
            return { success: false, fernYml: { org } };
        }

        // Collect generators.yml API configs and SDK results for each API.
        const generatorsYmlApis: Record<string, generatorsYml.ApiConfigurationSchema | undefined> = {};
        let combinedSdks: schemas.SdksSchema = { targets: {} };
        let defaultGroup: string | undefined;
        let autorelease: boolean | undefined;

        for (const apiName of apiNames) {
            const apiDir = join(apisDir, RelativeFilePath.of(apiName));

            const generatorsMigrator = new GeneratorsYmlMigrator({ cwd: apiDir, apiName });
            const generatorsResult = await generatorsMigrator.migrate();
            warnings.push(...generatorsResult.warnings);

            if (generatorsResult.absoluteFilePath != null) {
                migratedFiles.push(generatorsResult.absoluteFilePath);
            }

            generatorsYmlApis[apiName] = generatorsResult.rawApi;

            if (generatorsResult.sdks != null) {
                for (const [targetName, target] of Object.entries(generatorsResult.sdks.targets)) {
                    combinedSdks.targets[targetName] = target;
                }
                if (generatorsResult.sdks.defaultGroup != null && defaultGroup == null) {
                    defaultGroup = generatorsResult.sdks.defaultGroup;
                }
                if (generatorsResult.sdks.autorelease != null && autorelease == null) {
                    autorelease = generatorsResult.sdks.autorelease;
                }
            }
        }

        // Convert API configurations (handles Fern definition detection)
        const apisResult = await convertMultiApi({
            fernDir,
            apisDir,
            generatorsYmlApis
        });
        warnings.push(...apisResult.warnings);

        const fernYml: schemas.FernYmlSchema = {
            org,
            apis: apisResult.apis
        };

        if (Object.keys(combinedSdks.targets).length > 0) {
            if (defaultGroup != null) {
                combinedSdks.defaultGroup = defaultGroup;
            }
            if (autorelease != null) {
                combinedSdks.autorelease = autorelease;
            }
            fernYml.sdks = combinedSdks;
        }

        // Also check for generators.yml in the fern root (might have shared config)
        const rootGeneratorsMigrator = new GeneratorsYmlMigrator({ cwd: fernDir });
        const rootDetection = await rootGeneratorsMigrator.detect();
        if (rootDetection.found && rootDetection.absoluteFilePath != null) {
            warnings.push({
                type: "info",
                message: "Found generators.yml in fern root alongside apis/ directory",
                suggestion: "Review the migrated configuration to ensure it's correct"
            });
            migratedFiles.push(rootDetection.absoluteFilePath);
        }

        return { success: true, fernYml };
    }

    private async findFernDirectory(): Promise<AbsoluteFilePath | undefined> {
        const basename = this.cwd.split("/").pop();
        if (basename === FERN_DIRECTORY) {
            return this.cwd;
        }
        const fernDir = join(this.cwd, RelativeFilePath.of(FERN_DIRECTORY));
        if (await doesPathExist(fernDir, "directory")) {
            return fernDir;
        }

        return undefined;
    }

    private serializeFernYml(fernYml: schemas.FernYmlSchema): string {
        const doc: Record<string, unknown> = {
            edition: fernYml.edition,
            org: fernYml.org
        };
        if (fernYml.api != null) {
            doc.api = fernYml.api;
        }
        if (fernYml.apis != null) {
            doc.apis = fernYml.apis;
        }
        if (fernYml.ai != null) {
            doc.ai = fernYml.ai;
        }
        if (fernYml.cli != null) {
            doc.cli = fernYml.cli;
        }
        if (fernYml.sdks != null) {
            doc.sdks = fernYml.sdks;
        }
        return yaml.dump(doc, {
            indent: 2,
            lineWidth: 120,
            noRefs: true,
            sortKeys: false,
            quotingType: '"',
            forceQuotes: false
        });
    }
}
