export declare const LogLevel: {
    readonly Debug: "debug";
    readonly Info: "info";
    readonly Warn: "warn";
    readonly Error: "error";
};
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
export interface ILogger {
    /**
     * Logs a debug message.
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    debug(message: string, ...args: unknown[]): void;
    /**
     * Logs an info message.
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    info(message: string, ...args: unknown[]): void;
    /**
     * Logs a warning message.
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    warn(message: string, ...args: unknown[]): void;
    /**
     * Logs an error message.
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    error(message: string, ...args: unknown[]): void;
}
/**
 * Configuration for logger initialization.
 */
export interface LogConfig {
    /**
     * Minimum log level to output.
     * @default LogLevel.Info
     */
    level?: LogLevel;
    /**
     * Logger implementation to use.
     * @default new ConsoleLogger()
     */
    logger?: ILogger;
    /**
     * Whether logging should be silenced.
     * @default true
     */
    silent?: boolean;
}
/**
 * Default console-based logger implementation.
 */
export declare class ConsoleLogger implements ILogger {
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}
/**
 * Logger class that provides level-based logging functionality.
 */
export declare class Logger {
    private readonly level;
    private readonly logger;
    private readonly silent;
    /**
     * Creates a new logger instance.
     * @param config - Logger configuration
     */
    constructor(config: Required<LogConfig>);
    /**
     * Checks if a log level should be output based on configuration.
     * @param level - The log level to check
     * @returns True if the level should be logged
     */
    shouldLog(level: LogLevel): boolean;
    /**
     * Checks if debug logging is enabled.
     * @returns True if debug logs should be output
     */
    isDebug(): boolean;
    /**
     * Logs a debug message if debug logging is enabled.
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    debug(message: string, ...args: unknown[]): void;
    /**
     * Checks if info logging is enabled.
     * @returns True if info logs should be output
     */
    isInfo(): boolean;
    /**
     * Logs an info message if info logging is enabled.
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    info(message: string, ...args: unknown[]): void;
    /**
     * Checks if warning logging is enabled.
     * @returns True if warning logs should be output
     */
    isWarn(): boolean;
    /**
     * Logs a warning message if warning logging is enabled.
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    warn(message: string, ...args: unknown[]): void;
    /**
     * Checks if error logging is enabled.
     * @returns True if error logs should be output
     */
    isError(): boolean;
    /**
     * Logs an error message if error logging is enabled.
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    error(message: string, ...args: unknown[]): void;
}
export declare function createLogger(config?: LogConfig | Logger): Logger;
