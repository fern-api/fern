import { model as GeneratorLoggingApiModel } from "@fern-fern/generator-exec-client";
import { GeneratorConfig } from "@fern-fern/generator-exec-client/model/config";
import { ExitStatusUpdate, GeneratorUpdate } from "@fern-fern/generator-exec-client/model/logging";
import { createLogger, LogLevel } from "@fern-typescript/commons-v2";
import { readFile } from "fs/promises";
import { generateFiles } from "./generateFiles";
import { constructNpmPackage } from "./npm-package/constructNpmPackage";
import { publishPackageIfNecessary } from "./publishPackageIfNecessary";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, GeneratorLoggingApiModel.logging.LogLevel> = {
    [LogLevel.Debug]: GeneratorLoggingApiModel.logging.LogLevel.Debug,
    [LogLevel.Info]: GeneratorLoggingApiModel.logging.LogLevel.Info,
    [LogLevel.Warn]: GeneratorLoggingApiModel.logging.LogLevel.Warn,
    [LogLevel.Error]: GeneratorLoggingApiModel.logging.LogLevel.Error,
};

export async function runGenerator(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const config = JSON.parse(configStr.toString()) as GeneratorConfig;

    const generatorNotificationService = new GeneratorNotificationService(config);
    const logger = createLogger((message, level) => {
        // kick off log, but don't wait for it
        void generatorNotificationService.sendUpdate(
            GeneratorUpdate.log({
                message,
                level: LOG_LEVEL_CONVERSIONS[level],
            })
        );
    });

    const npmPackage = constructNpmPackage(config);

    await generatorNotificationService.sendUpdate(
        GeneratorUpdate.init({
            packagesToPublish: npmPackage.publishInfo != null ? [npmPackage.publishInfo.packageCoordinate] : [],
        })
    );

    try {
        const { writtenTo: pathToPackageOnDisk } = await generateFiles({
            config,
            logger,
            npmPackage,
        });
        await publishPackageIfNecessary({
            generatorNotificationService,
            logger,
            npmPackage,
            pathToPackageOnDisk,
        });
        await generatorNotificationService.sendUpdate(GeneratorUpdate.exitStatusUpdate(ExitStatusUpdate.successful()));
    } catch (e) {
        await generatorNotificationService.sendUpdate(
            GeneratorUpdate.exitStatusUpdate(
                ExitStatusUpdate.error({
                    message: e instanceof Error ? e.message : "Encountered error",
                })
            )
        );
        throw e;
    }
}
