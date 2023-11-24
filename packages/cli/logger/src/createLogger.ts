import { Logger } from "./Logger";
import { LogLevel } from "./LogLevel";

export function createLogger(log: (level: LogLevel, ...args: string[]) => void): Logger {
    return {
        debug: (...args) => log(LogLevel.Debug, ...args),
        info: (...args) => log(LogLevel.Info, ...args),
        warn: (...args) => log(LogLevel.Warn, ...args),
        error: (...args) => log(LogLevel.Error, ...args),
        log
    };
}
