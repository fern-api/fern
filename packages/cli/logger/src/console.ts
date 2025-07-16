import { LogLevel } from "./LogLevel"
import { Logger } from "./Logger"
import { createLogger } from "./createLogger"

export const CONSOLE_LOGGER: Logger = Object.freeze(createLogger(log))

function log(level: LogLevel, ...args: string[]): void {
    const consoleLogger = getConsoleLoggerForLevel(level)
    consoleLogger(...args)
}

function getConsoleLoggerForLevel(level: LogLevel): (...args: string[]) => void {
    switch (level) {
        case LogLevel.Trace:
            // biome-ignore lint/suspicious/noConsole: allow console
            return console.trace
        case LogLevel.Debug:
            // biome-ignore lint/suspicious/noConsole: allow console
            return console.debug
        case LogLevel.Info:
            // biome-ignore lint/suspicious/noConsole: allow console
            return console.info
        case LogLevel.Warn:
            // biome-ignore lint/suspicious/noConsole: allow console
            return console.warn
        case LogLevel.Error:
            // biome-ignore lint/suspicious/noConsole: allow console
            return console.error
    }
}
