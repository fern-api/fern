import { Logger, LogLevel } from "@fern-api/logger";
import type { Task } from "../../ui/Task";
import type { Context } from "../Context";

export class TaskContextLogger implements Logger {
    private readonly context: Context;
    private readonly task: Task;

    private enabled: boolean = true;
    private collectedErrors: string[] = [];

    constructor({ context, task }: { context: Context; task: Task }) {
        this.context = context;
        this.task = task;
    }

    public disable(): void {
        this.enabled = false;
    }

    public enable(): void {
        this.enabled = true;
    }

    public trace(..._args: string[]): void {
        // no-op for now.
    }

    public debug(...args: string[]): void {
        const message = args.join(" ");
        this.context.logFileWriter.write({ taskName: this.task.name, level: LogLevel.Debug, message });

        if (this.enabled && this.context.logLevel === LogLevel.Debug) {
            if (this.task.logs == null) {
                this.task.logs = [];
            }
            this.task.logs.push({ level: "debug", message });
        }
    }

    public info(...args: string[]): void {
        const message = args.join(" ");
        this.context.logFileWriter.write({ taskName: this.task.name, level: LogLevel.Info, message });

        // Given how noisy info logs are, we capture them as debug logs in the UI.
        if (this.enabled && this.context.logLevel === LogLevel.Debug) {
            if (this.task.logs == null) {
                this.task.logs = [];
            }
            this.task.logs.push({ level: "debug", message });
        }
    }

    public warn(...args: string[]): void {
        const message = args.join(" ");
        this.context.logFileWriter.write({ taskName: this.task.name, level: LogLevel.Warn, message });

        if (this.enabled) {
            if (this.task.logs == null) {
                this.task.logs = [];
            }
            this.task.logs.push({ level: "warn", message });
        }
    }

    public error(...args: string[]): void {
        const message = args.join(" ");
        this.context.logFileWriter.write({ taskName: this.task.name, level: LogLevel.Error, message });

        if (this.enabled) {
            this.collectedErrors.push(message);
            if (this.task.logs == null) {
                this.task.logs = [];
            }
            this.task.logs.push({ level: "error", message });
        }
    }

    public log(level: LogLevel, ...args: string[]): void {
        if (level === LogLevel.Debug) {
            this.debug(...args);
        } else if (level === LogLevel.Warn) {
            this.warn(...args);
        } else if (level === LogLevel.Error) {
            this.error(...args);
        }
    }
}
