import { CONSOLE_LOGGER, createLogger, Logger, LogLevel } from "@fern-api/logger";

import { FernGeneratorExec, GeneratorNotificationService } from "./GeneratorNotificationService.js";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
    [LogLevel.Trace]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Debug]: FernGeneratorExec.logging.LogLevel.Debug,
    [LogLevel.Info]: FernGeneratorExec.logging.LogLevel.Info,
    [LogLevel.Warn]: FernGeneratorExec.logging.LogLevel.Warn,
    [LogLevel.Error]: FernGeneratorExec.logging.LogLevel.Error
};

export abstract class AbstractGeneratorContext {
    public readonly logger: Logger;
    public readonly version: string | undefined;

    public constructor(
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        this.logger = createLogger((level, ...message) => {
            CONSOLE_LOGGER.log(level, ...message);

            try {
                generatorNotificationService.bufferUpdate(
                    FernGeneratorExec.GeneratorUpdate.log({
                        message: message.join(" "),
                        level: LOG_LEVEL_CONVERSIONS[level]
                    })
                );
            } catch (e) {
                // biome-ignore lint/suspicious/noConsole: allow console
                console.warn("Encountered error when sending update", e);
            }
        });

        this.version = getOutputModeVersion(config?.output?.mode);
    }
}

// Switches on `type` rather than `_visit` so plain JSON configs (no `_visit`) work too.
function getOutputModeVersion(mode: FernGeneratorExec.OutputMode | undefined): string | undefined {
    switch (mode?.type) {
        case "github":
        case "publish":
            return mode.version;
        default:
            return undefined;
    }
}
