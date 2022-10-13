import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-client/schemas";
import { createLogger, LogLevel } from "@fern-typescript/commons-v2";
import { readFile } from "fs/promises";
import { generateFiles } from "./generateFiles";
import { constructNpmPackage } from "./npm-package/constructNpmPackage";
import { publishPackageIfNecessary } from "./publishPackageIfNecessary";
import { GeneratorNotificationService } from "./utils/GeneratorNotificationService";

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
        FernGeneratorExec.GeneratorUpdate.init({
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
