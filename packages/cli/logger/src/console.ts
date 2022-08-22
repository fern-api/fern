import { Logger, LogLevel } from "./Logger";

export const CONSOLE_LOGGER: Logger = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    log: (content, level) => {
        getConsoleLoggerForLevel(level)(content);
    },
};

function getConsoleLoggerForLevel(level: LogLevel): (content: string) => void {
    switch (level) {
        case LogLevel.Debug:
            return console.debug;
        case LogLevel.Info:
            return console.info;
        case LogLevel.Warn:
            return console.warn;
        case LogLevel.Error:
            return console.error;
    }
}
