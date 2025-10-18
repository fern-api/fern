import { CONSOLE_LOGGER, createLogger, Logger, LogLevel } from "@fern-api/logger";

import { FernGeneratorExec, GeneratorNotificationService } from "./GeneratorNotificationService";

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
                generatorNotificationService.bufferUpdate({
                    _type: "log",
                    message: message.join(" "),
                    level: LOG_LEVEL_CONVERSIONS[level]
                });
            } catch (e) {
                // biome-ignore lint/suspicious/noConsole: allow console
                console.warn("Encountered error when sending update", e);
            }
        });

        const outputMode = config?.output?.mode;
        if (outputMode == null) {
            this.version = undefined;
        } else {
            switch (outputMode.type) {
                case "github":
                    this.version = outputMode.version;
                    break;
                case "publish":
                    this.version = outputMode.version;
                    break;
                case "downloadFiles":
                default:
                    this.version = undefined;
                    break;
            }
        }
    }
}
