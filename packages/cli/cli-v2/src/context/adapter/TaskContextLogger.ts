import { LOG_LEVELS, Logger, LogLevel } from "@fern-api/logger";
import chalk from "chalk";
import type { Task } from "../../ui/Task.js";
import type { Context } from "../Context.js";

export class TaskContextLogger implements Logger {
    private readonly context: Context;
    private readonly task: Task;
    private readonly logLevel: LogLevel;

    private enabled: boolean = true;
    private collectedErrors: string[] = [];

    constructor({ context, task, logLevel = LogLevel.Warn }: { context: Context; task: Task; logLevel?: LogLevel }) {
        this.context = context;
        this.task = task;
        this.logLevel = logLevel;
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
        this.context.logs.write({ taskName: this.task.name, level: LogLevel.Debug, message });
        this.writeToConsoleInCI(LogLevel.Debug, message);

        if (this.shouldLogToTask(LogLevel.Debug)) {
            if (this.task.logs == null) {
                this.task.logs = [];
            }
            this.task.logs.push({ level: "debug", message });
        }
    }

    public info(...args: string[]): void {
        const message = args.join(" ");
        this.context.logs.write({ taskName: this.task.name, level: LogLevel.Info, message });
        this.writeToConsoleInCI(LogLevel.Info, message);

        if (this.shouldLogToTask(LogLevel.Info)) {
            if (this.task.logs == null) {
                this.task.logs = [];
            }
            // Display info as debug in the UI since info logs tend to be noisy.
            this.task.logs.push({ level: "debug", message });
        }
    }

    public warn(...args: string[]): void {
        const message = args.join(" ");
        this.context.logs.write({ taskName: this.task.name, level: LogLevel.Warn, message });
        this.writeToConsoleInCI(LogLevel.Warn, message);

        if (this.shouldLogToTask(LogLevel.Warn)) {
            if (this.task.logs == null) {
                this.task.logs = [];
            }
            this.task.logs.push({ level: "warn", message });
        }
    }

    public error(...args: string[]): void {
        const message = args.join(" ");
        this.context.logs.write({ taskName: this.task.name, level: LogLevel.Error, message });
        this.writeToConsoleInCI(LogLevel.Error, message);

        if (this.shouldLogToTask(LogLevel.Error)) {
            this.collectedErrors.push(message);
            if (this.task.logs == null) {
                this.task.logs = [];
            }
            this.task.logs.push({ level: "error", message });
        }
    }

    public log(level: LogLevel, ...args: string[]): void {
        switch (level) {
            case LogLevel.Debug:
                this.debug(...args);
                break;
            case LogLevel.Info:
                this.info(...args);
                break;
            case LogLevel.Warn:
                this.warn(...args);
                break;
            case LogLevel.Error:
                this.error(...args);
                break;
        }
    }

    /**
     * In CI / non-TTY environments, write logs directly to stderr so they
     * are visible in CI runner output rather than hidden in a log file.
     */
    private writeToConsoleInCI(level: LogLevel, message: string): void {
        if (this.context.isTTY) {
            return;
        }
        if (!this.enabled) {
            return;
        }
        const prefix = chalk.dim(`[${this.task.name}]`);
        switch (level) {
            case LogLevel.Warn:
                process.stderr.write(`${prefix}: ${chalk.yellow(message)}\n`);
                break;
            case LogLevel.Error:
                process.stderr.write(`${prefix}: ${chalk.red(message)}\n`);
                break;
            default:
                process.stderr.write(`${prefix}: ${message}\n`);
                break;
        }
    }

    /**
     * Check if a message at the given level should be logged to the task's UI.
     */
    private shouldLogToTask(level: LogLevel): boolean {
        return this.enabled && LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(this.logLevel);
    }
}
