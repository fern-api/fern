import { Logger } from "./Logger";
import { LogLevel } from "./LogLevel";

export function createLogger(log: (message: string, level: LogLevel) => void): Logger {
    return {
        log,
        debug: (message) => log(message, LogLevel.Debug),
        info: (message) => log(message, LogLevel.Info),
        warn: (message) => log(message, LogLevel.Warn),
        error: (message) => log(message, LogLevel.Error),
    };
}
