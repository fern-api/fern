export type LogLevel = "debug" | "info" | "warn" | "error";

export class NopLogger {
    public disable(): void {
        // no-op
    }

    public enable(): void {
        // no-op
    }

    public debug(...args: string[]): void {
        // no-op
    }

    public info(...args: string[]): void {
        // no-op
    }

    public warn(...args: string[]): void {
        // no-op
    }

    public error(...args: string[]): void {
        // no-op
    }

    public log(level: LogLevel, ...args: string[]): void {
        // no-op
    }
}
