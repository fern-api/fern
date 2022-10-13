import { AbsoluteFilePath } from "@fern-api/core-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-client/schemas";
import { createLogger, LogLevel } from "@fern-typescript/commons-v2";
import { readFile } from "fs/promises";
import { generateFiles } from "./generateFiles";
import { constructNpmPackage } from "./npm-package/constructNpmPackage";
import { publishPackageIfNecessary } from "./publishPackageIfNecessary";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";
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
    const generatorNotificationService = new GeneratorNotificationService(config);

    try {
        const logger = createLogger((message, level) => {
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
            logger,
            npmPackage,
            runYarnCommand,
        });
        await publishPackageIfNecessary({
            config,
            generatorNotificationService,
            logger,
            npmPackage,
            pathToPackageOnDisk,
            runYarnCommand,
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
