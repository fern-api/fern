import { createLogger } from "./createLogger";
import { Logger } from "./Logger";
import { LogLevel } from "./LogLevel";

export const CONSOLE_LOGGER: Logger = Object.freeze(createLogger(log));

function log(level: LogLevel, ...args: string[]): void {
    const consoleLogger = getConsoleLoggerForLevel(level);
    consoleLogger(...args);
}

function getConsoleLoggerForLevel(level: LogLevel): (...args: string[]) => void {
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
