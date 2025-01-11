import { LogLevel } from "./LogLevel";
import { Logger } from "./Logger";

class LoggerImpl implements Logger {
    constructor(
        public readonly log: (level: LogLevel, ...args: string[]) => void,
        private enabled: boolean = true
    ) {}

    public disable(): void {
        this.enabled = false;
    }

    public enable(): void {
        this.enabled = true;
    }

    public debug(...args: string[]): void {
        if (this.enabled) {
            this.log(LogLevel.Debug, ...args);
        }
    }

    public info(...args: string[]): void {
        if (this.enabled) {
            this.log(LogLevel.Info, ...args);
        }
    }

    public warn(...args: string[]): void {
        if (this.enabled) {
            this.log(LogLevel.Warn, ...args);
        }
    }

    public error(...args: string[]): void {
        if (this.enabled) {
            this.log(LogLevel.Error, ...args);
        }
    }
}

export function createLogger(log: (level: LogLevel, ...args: string[]) => void): Logger {
    return new LoggerImpl(log);
}
