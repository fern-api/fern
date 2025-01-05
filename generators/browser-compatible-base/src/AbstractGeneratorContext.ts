import { CONSOLE_LOGGER, LogLevel, Logger, createLogger } from "@fern-api/logger";

import { FernGeneratorExec, GeneratorNotificationService } from "./GeneratorNotificationService";
import { getSdkVersion } from "./utils";

const LOG_LEVEL_CONVERSIONS: Record<LogLevel, FernGeneratorExec.logging.LogLevel> = {
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
                // eslint-disable-next-line no-console
                console.warn("Encountered error when sending update", e);
            }
        });

        this.version = config?.output?.mode?._visit({
            downloadFiles: () => undefined,
            github: (github) => github.version,
            publish: (publish) => publish.version,
            _other: () => undefined
        });
    }
}
