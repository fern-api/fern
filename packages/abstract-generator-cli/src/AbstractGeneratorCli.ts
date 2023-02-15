import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createLogger, Logger, LogLevel } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { NpmPackage, PersistedTypescriptProject } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { readFile } from "fs/promises";
import { constructNpmPackage } from "./constructNpmPackage";
import { GeneratorNotificationService } from "./GeneratorNotificationService";
import { loadIntermediateRepresentation } from "./loadIntermediateRepresentation";
import { publishPackage } from "./publishPackage";
import { writeGitHubWorkflows } from "./writeGitHubWorkflows";

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
        const config = GeneratorExecParsing.GeneratorConfig.parse(rawConfig);
        const generatorNotificationService = new GeneratorNotificationService(config);

        try {
            const customConfig = this.parseCustomConfig(config.customConfig);

            const logger = createLogger((level, ...message) => {
                // eslint-disable-next-line no-console
                console.log(...message);
                // kick off log, but don't wait for it
                void generatorNotificationService.sendUpdate(
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

            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.initV2({
                    publishingToRegistry:
                        npmPackage.publishInfo != null ? FernGeneratorExec.RegistryType.Npm : undefined,
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

            await config.output.mode._visit<void | Promise<void>>({
                publish: async () => {
                    await publishPackage({
                        logger,
                        npmPackage,
                        dryRun: config.dryRun,
                        generatorNotificationService,
                        typescriptProject,
                    });
                    await typescriptProject.npmPack({
                        logger,
                        location: AbsoluteFilePath.of(config.output.path),
                    });
                },
                github: async (githubOutputMode) => {
                    await typescriptProject.format(logger);
                    await typescriptProject.deleteGitIgnoredFiles(logger);
                    await typescriptProject.moveProjectTo(AbsoluteFilePath.of(config.output.path));
                    await writeGitHubWorkflows({
                        config,
                        githubOutputMode,
                        isPackagePrivate: npmPackage.private,
                    });
                },
                downloadFiles: async () => {
                    await typescriptProject.moveDistTo(AbsoluteFilePath.of(config.output.path), { logger });
                },
                _other: ({ type }) => {
                    throw new Error(`${type} mode is not implemented`);
                },
            });

            await generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.exitStatusUpdate(FernGeneratorExec.ExitStatusUpdate.successful())
            );
        } catch (e) {
            await generatorNotificationService.sendUpdate(
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
        npmPackage: NpmPackage;
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
