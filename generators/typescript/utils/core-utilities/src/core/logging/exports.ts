import * as logger from "./logger";

export namespace logging {
    export const createLogger = logger.createLogger;
    export type LogConfig = logger.LogConfig;
    export type LogLevel = logger.LogLevel;
    export const ConsoleLogger = logger.ConsoleLogger;
    export type ConsoleLogger = logger.ConsoleLogger;
}
