import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER, createLogger, Logger, LogLevel } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { NpmPackage, PersistedTypescriptProject } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { readFile } from "fs/promises";
import { constructNpmPackage } from "./constructNpmPackage";
import { GeneratorNotificationServiceImpl } from "./GeneratorNotificationService";
import { loadIntermediateRepresentation } from "./loadIntermediateRepresentation";
import { publishPackage } from "./publishPackage";
import { writeGitHubWorkflows } from "./writeGitHubWorkflows";

const OUTPUT_ZIP_FILENAME = "output.zip";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
    [LogLevel.Debug]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Info]: FernGeneratorExec.logging.LogLevel.Info,
    [LogLevel.Warn]: FernGeneratorExec.logging.LogLevel.Warn,
    [LogLevel.Error]: FernGeneratorExec.logging.LogLevel.Error,
};

export abstract class AbstractGeneratorCli<CustomConfig> {
    public async runCli(): Promise<void> {
        const pathToConfig = process.argv[process.argv.length - 1];
        if (pathToConfig == null) {
            throw new Error("No argument for config filepath.");
        }
        await this.run(pathToConfig);
    }

    public async run(pathToConfig: string): Promise<void> {
        const configStr = await readFile(pathToConfig);
        const rawConfig = JSON.parse(configStr.toString());
        const config = await GeneratorExecParsing.GeneratorConfig.parseOrThrow({
            ...rawConfig,
            // in this version of the fiddle client, it requires unknown
            // properties to be present
            customConfig: rawConfig.customConfig ?? {},
        });
        const generatorNotificationService =
            config.environment.type === "remote" ? new GeneratorNotificationServiceImpl(config.environment) : undefined;

        try {
            const customConfig = this.parseCustomConfig(config.customConfig);

            const logger = createLogger((level, ...message) => {
                CONSOLE_LOGGER.log(level, ...message);

                // kick off log, but don't wait for it
                void generatorNotificationService?.sendUpdateAndSwallowError(
                    FernGeneratorExec.GeneratorUpdate.log({
                        message: message.join(" "),
                        level: LOG_LEVEL_CONVERSIONS[level],
                    })
                );
            });

            const npmPackage = constructNpmPackage({
                generatorConfig: config,
                isPackagePrivate: this.isPackagePrivate(customConfig),
            });

            await generatorNotificationService?.sendUpdateOrThrow(
                FernGeneratorExec.GeneratorUpdate.initV2({
                    publishingToRegistry:
                        npmPackage?.publishInfo != null ? FernGeneratorExec.RegistryType.Npm : undefined,
                })
            );

            const generatorContext = new GeneratorContextImpl(logger);
            const typescriptProject = await this.generateTypescriptProject({
                config,
                customConfig,
                npmPackage,
                generatorContext,
                intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
            });
            if (!generatorContext.didSucceed()) {
                throw new Error("Failed to generate TypeScript project.");
            }

            const destinationZip = join(AbsoluteFilePath.of(config.output.path), OUTPUT_ZIP_FILENAME);
            await config.output.mode._visit<void | Promise<void>>({
                publish: async () => {
                    await publishPackage({
                        logger,
                        npmPackage,
                        dryRun: config.dryRun,
                        generatorNotificationService,
                        typescriptProject,
                    });
                    await typescriptProject.npmPackAsZipTo({
                        logger,
                        destinationZip,
                    });
                },
                github: async (githubOutputMode) => {
                    await typescriptProject.format(logger);
                    await typescriptProject.deleteGitIgnoredFiles(logger);
                    await typescriptProject.writeArbitraryFiles(async (pathToProject) => {
                        await writeGitHubWorkflows({
                            githubOutputMode,
                            isPackagePrivate: npmPackage != null && npmPackage.private,
                            pathToProject,
                        });
                    });
                    await typescriptProject.copyProjectAsZipTo({
                        logger,
                        destinationZip,
                    });
                },
                downloadFiles: async () => {
                    await typescriptProject.copyDistAsZipTo({
                        destinationZip,
                        logger,
                    });
                },
                _other: ({ type }) => {
                    throw new Error(`${type} mode is not implemented`);
                },
            });

            await generatorNotificationService?.sendUpdateOrThrow(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(
                    FernGeneratorExec.ExitStatusUpdate.successful({
                        zipFilename: OUTPUT_ZIP_FILENAME,
                    })
                )
            );
        } catch (e) {
            await generatorNotificationService?.sendUpdateOrThrow(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(
                    FernGeneratorExec.ExitStatusUpdate.error({
                        message: e instanceof Error ? e.message : "Encountered error",
                    })
                )
            );
            throw e;
        }
    }

    protected abstract parseCustomConfig(customConfig: unknown): CustomConfig;
    protected abstract generateTypescriptProject(args: {
        config: FernGeneratorExec.GeneratorConfig;
        customConfig: CustomConfig;
        npmPackage: NpmPackage | undefined;
        generatorContext: GeneratorContext;
        intermediateRepresentation: IntermediateRepresentation;
    }): Promise<PersistedTypescriptProject>;
    protected abstract isPackagePrivate(customConfig: CustomConfig): boolean;
}

class GeneratorContextImpl implements GeneratorContext {
    private isSuccess = true;

    constructor(public readonly logger: Logger) {}

    public fail(): void {
        this.isSuccess = false;
    }

    public didSucceed(): boolean {
        return this.isSuccess;
    }
}
