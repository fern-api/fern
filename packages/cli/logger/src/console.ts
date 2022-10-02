import { Logger } from "./Logger";
import { LogLevel } from "./LogLevel";

export const CONSOLE_LOGGER: Logger = {
    debug: (...args) => log(LogLevel.Debug, ...args),
    info: (...args) => log(LogLevel.Info, ...args),
    warn: (...args) => log(LogLevel.Warn, ...args),
    error: (...args) => log(LogLevel.Error, ...args),
    log,
};

function log(level: LogLevel, ...args: unknown[]): void {
    const consoleLogger = getConsoleLoggerForLevel(level);
    consoleLogger(...args);
}

function getConsoleLoggerForLevel(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
        case LogLevel.Debug:
            // eslint-disable-next-line no-console
            return console.debug;
        case LogLevel.Info:
            // eslint-disable-next-line no-console
            return console.info;
        case LogLevel.Warn:
            // eslint-disable-next-line no-console
            return console.warn;
        case LogLevel.Error:
            // eslint-disable-next-line no-console
            return console.error;
    }
}
