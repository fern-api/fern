const LogLevel = {
    Debug: 4,
    Info: 3,
    Warn: 2,
    Error: 1,
} as const;
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface ILogger {
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
}

export interface LogConfig {
    level?: LogLevel;
    logger?: ILogger;
    silent?: boolean;
}

export class ConsoleLogger implements ILogger {
    debug(message: string, ...args: unknown[]): void {
        console.debug(message, ...args);
    }
    info(message: string, ...args: unknown[]): void {
        console.info(message, ...args);
    }
    warn(message: string, ...args: unknown[]): void {
        console.warn(message, ...args);
    }
    error(message: string, ...args: unknown[]): void {
        console.error(message, ...args);
    }
}

export class Logger {
    constructor(private readonly config: Required<LogConfig>) {}

    public shouldLog(level: LogLevel): boolean {
        return !this.config.silent && this.config.level >= level;
    }

    public isDebug(): boolean {
        return this.shouldLog(LogLevel.Debug);
    }

    public debug(message: string, ...args: unknown[]): void {
        if (this.isDebug()) {
            this.config.logger.debug(message, ...args);
        }
    }

    public isInfo(): boolean {
        return this.shouldLog(LogLevel.Info);
    }

    public info(message: string, ...args: unknown[]): void {
        if (this.isInfo()) {
            this.config.logger.info(message, ...args);
        }
    }

    public isWarn(): boolean {
        return this.shouldLog(LogLevel.Warn);
    }

    public warn(message: string, ...args: unknown[]): void {
        if (this.isWarn()) {
            this.config.logger.warn(message, ...args);
        }
    }

    public isError(): boolean {
        return this.shouldLog(LogLevel.Error);
    }

    public error(message: string, ...args: unknown[]): void {
        if (this.isError()) {
            this.config.logger.error(message, ...args);
        }
    }
}

export function createLogger(config?: LogConfig | Logger): Logger {
    if (config == null) {
        return defaultLogger;
    }
    if (config instanceof Logger) {
        return config;
    }
    config = config ?? {};
    config.level ??= LogLevel.Info;
    config.logger ??= new ConsoleLogger();
    config.silent ??= true;
    return new Logger(config as Required<LogConfig>);
}

const defaultLogger: Logger = new Logger({
    level: LogLevel.Info,
    logger: new ConsoleLogger(),
    silent: true,
});
