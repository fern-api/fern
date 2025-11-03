export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface Logger {
    debug(message: string, metadata?: unknown): void;
    info(message: string, metadata?: unknown): void;
    warn(message: string, metadata?: unknown): void;
    error(message: string, metadata?: unknown): void;
}

export interface LoggingConfig {
    logger?: Logger;
    logLevel?: LogLevel;
}

const DEFAULT_LOG_LEVEL: LogLevel = "silent";

const LEVEL_ORDER: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
    silent: 100
};

export function parseLogLevel(input: unknown): LogLevel {
    if (typeof input === "string") {
        const normalized = input.toLowerCase();
        if (
            normalized === "debug" ||
            normalized === "info" ||
            normalized === "warn" ||
            normalized === "error" ||
            normalized === "silent"
        ) {
            return normalized as LogLevel;
        }
    }
    return DEFAULT_LOG_LEVEL;
}

export function resolveLogLevel(config?: LoggingConfig): LogLevel {
    if (config?.logLevel != null) {
        return config.logLevel;
    }

    if (typeof process !== "undefined" && process?.env?.LOG_LEVEL != null) {
        return parseLogLevel(process.env.LOG_LEVEL);
    }

    return DEFAULT_LOG_LEVEL;
}

export function shouldLog(currentLevel: LogLevel, targetLevel: LogLevel): boolean {
    return LEVEL_ORDER[currentLevel] <= LEVEL_ORDER[targetLevel];
}

export class ConsoleLogger implements Logger {
    public debug(message: string, metadata?: unknown): void {
        console.debug(message, metadata);
    }

    public info(message: string, metadata?: unknown): void {
        console.info(message, metadata);
    }

    public warn(message: string, metadata?: unknown): void {
        console.warn(message, metadata);
    }

    public error(message: string, metadata?: unknown): void {
        console.error(message, metadata);
    }
}

export function createLogger(config?: LoggingConfig): Logger | undefined {
    if (config?.logger != null) {
        return config.logger;
    }

    const level = resolveLogLevel(config);
    if (level === "silent") {
        return undefined;
    }

    return new ConsoleLogger();
}
