import * as logger from "./logger.mjs";
export declare namespace logging {
    /**
     * Configuration for logger instances.
     */
    type LogConfig = logger.LogConfig;
    type LogLevel = logger.LogLevel;
    const LogLevel: typeof logger.LogLevel;
    type ILogger = logger.ILogger;
    /**
     * Console logger implementation that outputs to the console.
     */
    type ConsoleLogger = logger.ConsoleLogger;
    /**
     * Console logger implementation that outputs to the console.
     */
    const ConsoleLogger: typeof logger.ConsoleLogger;
}
