import { AbsoluteFilePath } from "@fern-api/core-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import { GeneratorConfig } from "@fern-fern/generator-exec-client/api";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-client/schemas";
import { createLogger, LogLevel } from "@fern-typescript/commons-v2";
import { readFile } from "fs/promises";
import { SdkCustomConfigSchema } from "./custom-config/schema/SdkCustomConfigSchema";
import { SdkCustomConfig } from "./custom-config/SdkCustomConfig";
import { generateFiles } from "./generateFiles";
import { constructNpmPackage } from "./npm-package/constructNpmPackage";
import { publishPackage } from "./publishPackage";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";
import { writeGitHubWorkflows } from "./writeGitHubWorkflows";
import { createYarnRunner } from "./yarnRunner";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
    [LogLevel.Debug]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Info]: FernGeneratorExec.logging.LogLevel.Info,
    [LogLevel.Warn]: FernGeneratorExec.logging.LogLevel.Warn,
    [LogLevel.Error]: FernGeneratorExec.logging.LogLevel.Error,
};

export async function runGenerator(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const rawConfig = JSON.parse(configStr.toString());
    const config = GeneratorExecParsing.GeneratorConfig.parse(rawConfig);
    const customConfig = parseCustomConfig(config);
    const generatorNotificationService = new GeneratorNotificationService(config);

    try {
        const logger = createLogger((message, level) => {
            // eslint-disable-next-line no-console
            console.log(message);
            // kick off log, but don't wait for it
            void generatorNotificationService.sendUpdate(
                FernGeneratorExec.GeneratorUpdate.log({
                    message,
                    level: LOG_LEVEL_CONVERSIONS[level],
                })
            );
        });

        const npmPackage = constructNpmPackage(config);

        await generatorNotificationService.sendUpdate(
            FernGeneratorExec.GeneratorUpdate.initV2({
                publishingToRegistry: npmPackage.publishInfo != null ? FernGeneratorExec.RegistryType.Npm : undefined,
            })
        );

        const runYarnCommand = createYarnRunner(logger, AbsoluteFilePath.of(config.output.path));

        const { writtenTo: pathToPackageOnDisk } = await generateFiles({
            config,
            customConfig,
            logger,
            npmPackage,
            runYarnCommand,
        });

        await config.output.mode._visit({
            publish: async () => {
                if (npmPackage.publishInfo == null) {
                    throw new Error("npmPackage.publishInfo is not defined.");
                }
                await publishPackage({
                    generatorNotificationService,
                    logger,
                    publishInfo: npmPackage.publishInfo,
                    pathToPackageOnDisk,
                    runYarnCommand,
                    dryRun: config.dryRun,
                });
            },
            github: async (githubOutputMode) => {
                await writeGitHubWorkflows({
                    config,
                    githubOutputMode,
                    customConfig,
                });
            },
            downloadFiles: () => {
                throw new Error("download-files output mode is not implemented");
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

function parseCustomConfig(config: GeneratorConfig): SdkCustomConfig {
    const customConfig = config.customConfig != null ? SdkCustomConfigSchema.parse(config.customConfig) : undefined;
    return {
        useBrandedStringAliases: customConfig?.useBrandedStringAliases ?? false,
        private: customConfig?.private ?? false,
    };
}
