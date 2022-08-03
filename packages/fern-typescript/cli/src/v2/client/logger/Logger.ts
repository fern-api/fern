import { LogLevel } from "@fern-fern/generator-logging-api-client/model";

export interface Logger {
    log: (message: string, level: LogLevel) => void;
    debug: (message: string) => void;
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
}

export function createLogger(log: (message: string, level: LogLevel) => void): Logger {
    return {
        log,
        debug: (message) => log(message, LogLevel.Debug),
        info: (message) => log(message, LogLevel.Info),
        warn: (message) => log(message, LogLevel.Warn),
        error: (message) => log(message, LogLevel.Error),
    };
}
