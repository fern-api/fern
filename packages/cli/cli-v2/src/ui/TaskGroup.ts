import { TtyAwareLogger } from "@fern-api/cli-logger";
import { assertNever } from "@fern-api/core-utils";
import chalk from "chalk";
import { Context } from "../context/Context";
import type { Task } from "./Task";
import type { TaskLog } from "./TaskLog";
import type { TaskStatus } from "./TaskStatus";

export declare namespace TaskGroup {
    export interface Config {
        /** The CLI context */
        context: Context;
        /** Stream to write to (defaults to stderr) */
        stream?: NodeJS.WriteStream;
    }

    export interface CompleteResult {
        successCount: number;
        failedCount: number;
        duration: string;
    }
}

/**
 * Manages a group of tasks with visual progress tracking.
 *
 * Uses TtyAwareLogger for all TTY coordination (clear/repaint/cursor).
 */
export class TaskGroup {
    private readonly context: Context;
    private readonly ttyAwareLogger: TtyAwareLogger;
    private readonly stream: NodeJS.WriteStream;
    private readonly tasks: Record<string, Task> = {};
    private readonly taskOrder: string[] = [];

    private startTime: number | undefined;
    private isRegistered = false;

    constructor(config: TaskGroup.Config) {
        this.context = config.context;
        this.ttyAwareLogger = this.context.getTtyAwareLogger();
        this.stream = config.stream ?? process.stderr;
    }

    /**
     * Add a task to the group.
     */
    public addTask(task: Omit<Task, "status"> & { status?: TaskStatus }): this {
        const fullTask: Task = {
            ...task,
            status: task.status ?? "pending"
        };
        this.tasks[task.id] = fullTask;
        this.taskOrder.push(task.id);
        return this;
    }

    /**
     * Start the task group display.
     */
    public async start(header?: { title: string; subtitle?: string }): Promise<this> {
        this.startTime = Date.now();

        this.register();

        if (header != null) {
            await this.ttyAwareLogger.takeOverTerminal(() => {
                this.stream.write("\n");
                this.stream.write(`${chalk.cyan("◆")} ${chalk.bold(header.title)}\n`);
                if (header.subtitle != null) {
                    this.stream.write(`  ${chalk.dim(header.subtitle)}\n`);
                }
                this.stream.write("\n");
            });
        }

        return this;
    }

    /**
     * Get a task by ID.
     */
    public getTask(taskId: string): Task | undefined {
        return this.tasks[taskId];
    }

    /**
     * Update a task's status.
     */
    public updateTask({
        id,
        update
    }: {
        id: string;
        update: Partial<Pick<Task, "status" | "currentStep" | "error" | "output">>;
    }): this {
        const task = this.tasks[id];
        if (task == null) {
            return this;
        }

        const prevStatus = task.status;
        if (update.status != null) {
            task.status = update.status;
        }
        if (update.currentStep !== undefined) {
            task.currentStep = update.currentStep;
        }
        if (update.error !== undefined) {
            task.error = update.error;
        }
        if (update.output !== undefined) {
            task.output = update.output;
        }

        // Register with TtyAwareLogger when first task starts running
        if (prevStatus !== "running" && task.status === "running") {
            task.startTime = Date.now();
        }

        if (prevStatus === "running" && (task.status === "success" || task.status === "error")) {
            task.endTime = Date.now();
        }

        return this;
    }

    /**
     * Called by TtyAwareLogger to get the current display.
     * This is the integration point with TtyAwareLogger.
     */
    public printInteractiveTasks({ spinner }: { spinner: string }): string {
        const lines: string[] = [];

        for (const id of this.taskOrder) {
            const task = this.tasks[id];
            if (task == null) {
                continue;
            }

            const line = this.formatTaskLine(task, spinner);
            if (line != null) {
                lines.push(line);
            }
        }

        if (lines.length === 0) {
            return "";
        }

        // Return just the task lines - TtyAwareLogger adds the box frame.
        return lines.join("\n");
    }

    /**
     * Complete the task group and show summary.
     */
    public complete({
        successMessage,
        errorMessage
    }: {
        successMessage: string;
        errorMessage: string;
    }): TaskGroup.CompleteResult {
        // Mark any still-running tasks as interrupted.
        for (const task of Object.values(this.tasks)) {
            if (task.status === "running") {
                task.status = "error";
                task.error = "Interrupted";
                task.endTime = Date.now();
            }
        }

        this.ttyAwareLogger.finish();

        let successCount = 0;
        let failedCount = 0;
        for (const task of Object.values(this.tasks)) {
            if (task.status === "success") {
                successCount++;
            } else if (task.status === "error") {
                failedCount++;
            }
        }

        const duration = this.startTime != null ? this.formatDuration(Date.now() - this.startTime) : "0s";

        this.stream.write("\n");
        if (failedCount === 0) {
            this.stream.write(`${chalk.green("✓")} ${successMessage} ${chalk.dim(`in ${duration}`)}\n`);
        } else {
            this.stream.write(`${chalk.red("✕")} ${errorMessage} ${chalk.dim(`in ${duration}`)}\n`);
        }

        const logFilePath = this.context.getLogFilePath();
        if (logFilePath != null) {
            this.stream.write(`\n${chalk.dim(`Logs written to: ${logFilePath}`)}\n`);
        }

        this.stream.write("\n");

        return { successCount, failedCount, duration };
    }

    private formatTaskLine(task: Task, spinnerFrame: string): string | undefined {
        const name = chalk.bold(task.name);
        const logLines = this.formatTaskLogs(task.logs);
        switch (task.status) {
            case "pending":
                return undefined;
            case "running": {
                const step = task.currentStep != null ? `  ${chalk.dim(task.currentStep)}` : "";
                return `${spinnerFrame} ${name}${step}${logLines}`;
            }
            case "success": {
                const duration = this.formatTaskDuration(task);
                const outputLines =
                    task.output != null && task.output.length > 0
                        ? task.output.map((output) => `\n    ${chalk.dim("→")} ${chalk.cyan(output)}`).join("")
                        : "";
                return `${chalk.green("✓")} ${name}${duration}${logLines}${outputLines}`;
            }
            case "error": {
                const duration = this.formatTaskDuration(task);
                const errorLines = this.formatMultilineError(task.error);
                return `${chalk.red("x")} ${name}${duration}${logLines}${errorLines}`;
            }
            case "skipped":
                return `${chalk.dim("○")} ${chalk.dim(name)} ${chalk.dim("(skipped)")}`;
            default:
                assertNever(task.status);
        }
    }

    private static readonly MAX_DISPLAYED_LOGS_TTY = 10;

    private formatTaskLogs(logs: TaskLog[] | undefined): string {
        if (logs == null || logs.length === 0) {
            return "";
        }

        // In TTY mode (interactive), limit logs to avoid overwhelming the display.
        // In CI/non-TTY mode, show all logs since the console can handle scrolling.
        const shouldLimit = this.context.isTTY;
        const logsToShow =
            shouldLimit && logs.length > TaskGroup.MAX_DISPLAYED_LOGS_TTY
                ? logs.slice(-TaskGroup.MAX_DISPLAYED_LOGS_TTY)
                : logs;
        const hiddenCount = logs.length - logsToShow.length;

        // Get max message length for TTY mode to prevent line wrapping
        const maxMessageLength = shouldLimit ? this.getMaxLogMessageLength() : Infinity;

        const formattedLogs = logsToShow
            .map((log) => {
                const message = shouldLimit ? this.truncateMessage(log.message, maxMessageLength) : log.message;
                switch (log.level) {
                    case "debug": {
                        const icon = chalk.dim("•");
                        return `\n    ${icon} ${chalk.dim(message)}`;
                    }
                    case "warn": {
                        const icon = chalk.yellow("⚠");
                        return `\n    ${icon} ${chalk.yellow(message)}`;
                    }
                    case "error": {
                        const icon = chalk.red("✗");
                        return `\n    ${icon} ${chalk.red(message)}`;
                    }
                    default:
                        assertNever(log.level);
                }
            })
            .join("");

        if (hiddenCount > 0) {
            return `\n    ${chalk.dim(`... ${hiddenCount} earlier logs hidden ...`)}${formattedLogs}`;
        }

        return formattedLogs;
    }

    /**
     * Maximum characters for a log message line in TTY mode.
     * This prevents terminal line wrapping which breaks the paint/clear cycle.
     *
     * Account for: box prefix "│ " (2) + indent "    " (4) + icon + space "• " (2) = 8 chars
     * Use 72 chars for message to stay under 80 col, or scale with terminal width.
     */
    private getMaxLogMessageLength(): number {
        const terminalWidth = this.stream.columns ?? 80;
        // Reserve space for: "│     • " prefix (8 chars) + some margin
        return Math.max(40, terminalWidth - 12);
    }

    private truncateMessage(message: string, maxLength: number): string {
        const sanitized = message.replace(/[\r\n]+/g, " ").trim();
        if (sanitized.length <= maxLength) {
            return sanitized;
        }
        return sanitized.slice(0, maxLength - 3) + "...";
    }

    private formatTaskDuration(task: Task): string {
        if (task.startTime != null && task.endTime != null) {
            return chalk.dim(` ${this.formatDuration(task.endTime - task.startTime)}`);
        }
        return "";
    }

    private formatMultilineError(error: string | undefined): string {
        if (error == null) {
            return "";
        }
        // Split error into lines and format each with proper indentation.
        const lines = error.split("\n").filter((line) => line.trim().length > 0);
        return lines.map((line) => `\n    ${chalk.red(line)}`).join("");
    }

    private formatDuration(ms: number): string {
        if (ms < 1000) {
            return `${ms}ms`;
        }
        const seconds = ms / 1000;
        if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s`;
    }

    /**
     * Register this TaskGroup with TtyAwareLogger for coordinated rendering.
     */
    private register(): void {
        if (this.isRegistered) {
            return;
        }
        this.isRegistered = true;
        this.ttyAwareLogger.registerTask(this);
    }
}
