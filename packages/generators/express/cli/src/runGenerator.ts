import { noop } from "@fern-api/core-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { readFile } from "fs/promises";
import { ExpressCustomConfig } from "./custom-config/ExpressCustomConfig";
import { ExpressCustomConfigSchema } from "./custom-config/schema/ExpressCustomConfigSchema";
import { generateFiles } from "./generateFiles";
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
    const customConfig = parseCustomConfig(config);
    const generatorNotificationService = new GeneratorNotificationService(config);

    try {
        config.output.mode._visit<void>({
            publish: async () => {
                throw new Error("Publishing is not supported.");
            },
            github: async () => {
                throw new Error("Github publishing is not supported.");
            },
            downloadFiles: noop,
            _other: ({ type }) => {
                throw new Error(`${type} mode is not implemented`);
            },
        });

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

        await generatorNotificationService.sendUpdate(
            FernGeneratorExec.GeneratorUpdate.initV2({
                publishingToRegistry: undefined,
            })
        );

        await generateFiles({
            config,
            customConfig,
            logger,
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

function parseCustomConfig(config: FernGeneratorExec.GeneratorConfig): ExpressCustomConfig {
    const customConfig = config.customConfig != null ? ExpressCustomConfigSchema.parse(config.customConfig) : undefined;
    return {
        useBrandedStringAliases: customConfig?.useBrandedStringAliases ?? false,
    };
}
