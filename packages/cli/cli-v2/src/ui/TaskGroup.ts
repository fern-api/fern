import { TtyAwareLogger } from "@fern-api/cli-logger";
import { assertNever } from "@fern-api/core-utils";
import chalk from "chalk";
import { Context } from "../context/Context.js";
import { formatMultilineText } from "./format.js";
import type { Task } from "./Task.js";
import type { TaskLog } from "./TaskLog.js";
import type { TaskStage, TaskStageDefinition } from "./TaskStage.js";
import type { TaskStatus } from "./TaskStatus.js";

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
    private static readonly MAX_DISPLAYED_LOGS_TTY = 10;
    private static readonly URL_PATTERN = /https?:\/\/[^\s]+/;

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

        // Write header before registering to avoid paint/freeze issues.
        // If we register first, takeOverTerminal() would freeze the initial paint.
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

        this.register();

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
        if (prevStatus !== "running" && task.status === "running") {
            task.startTime = Date.now();
        }
        if (prevStatus === "running" && (task.status === "success" || task.status === "error")) {
            task.endTime = Date.now();
        }
        return this;
    }

    /**
     * Define all stages upfront so users see the full journey. All stages start as "pending".
     */
    public setStages(taskId: string, stages: TaskStageDefinition[]): this {
        const task = this.tasks[taskId];
        if (task == null) {
            return this;
        }
        task.stages = stages.map((stage) => ({
            id: stage.id,
            status: "pending" as const,
            labels: stage.labels
        }));
        return this;
    }

    /**
     * Update a stage's status by ID. The displayed label automatically changes based on the status.
     */
    public updateStage({
        taskId,
        stageId,
        status,
        options
    }: {
        taskId: string;
        stageId: string;
        status: TaskStatus;
        options?: { detail?: string; error?: string };
    }): this {
        const task = this.tasks[taskId];
        if (task == null) {
            return this;
        }
        if (task.stages == null) {
            return this;
        }
        const stage = task.stages.find((s) => s.id === stageId);
        if (stage == null) {
            return this;
        }
        stage.status = status;
        if (options?.detail !== undefined) {
            stage.detail = options.detail;
        }
        if (options?.error !== undefined) {
            stage.error = options.error;
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
        const hasStages = task.stages != null && task.stages.length > 0;

        switch (task.status) {
            case "pending": {
                // Show pending tasks with stages so users see the full journey.
                if (hasStages) {
                    const stageLines = this.formatTaskStages(task.stages, spinnerFrame);
                    return `${chalk.dim("○")} ${chalk.dim(name)}${stageLines}`;
                }
                return undefined;
            }
            case "running": {
                if (hasStages) {
                    const stageLines = this.formatTaskStages(task.stages, spinnerFrame, task.logs);
                    return `${spinnerFrame} ${name}${stageLines}`;
                }
                const step = task.currentStep != null ? `  ${chalk.dim(task.currentStep)}` : "";
                return `${spinnerFrame} ${name}${step}`;
            }
            case "success": {
                const duration = this.formatTaskDuration(task);
                if (hasStages) {
                    const stageLines = this.formatTaskStages(task.stages, spinnerFrame);
                    const outputLines =
                        task.output != null && task.output.length > 0
                            ? task.output.map((output) => `\n    ${chalk.dim("→")} ${chalk.cyan(output)}`).join("")
                            : "";
                    return `${chalk.green("✓")} ${name}${duration}${stageLines}${outputLines}`;
                }
                const outputLines =
                    task.output != null && task.output.length > 0
                        ? task.output.map((output) => `\n    ${chalk.dim("→")} ${chalk.cyan(output)}`).join("")
                        : "";
                return `${chalk.green("✓")} ${name}${duration}${outputLines}`;
            }
            case "error": {
                const duration = this.formatTaskDuration(task);
                if (hasStages) {
                    const stageLines = this.formatTaskStages(task.stages, spinnerFrame, task.logs);
                    return `${chalk.red("✗")} ${name}${duration}${stageLines}`;
                }
                const errorLines = formatMultilineText({ text: task.error, colorFn: chalk.red.bind(chalk) });
                return `${chalk.red("✗")} ${name}${duration}${errorLines}`;
            }
            case "skipped": {
                const reason = task.skipReason != null ? `skipped: ${task.skipReason}` : "skipped";
                return `${chalk.dim("○")} ${chalk.dim(name)} ${chalk.dim(`(${reason})`)}`;
            }
            default:
                assertNever(task.status);
        }
    }

    /**
     * Format the stages for a task as indented lines. When a stage fails, logs are shown under it.
     */
    private formatTaskStages(stages: TaskStage[] | undefined, spinnerFrame: string, logs?: TaskLog[]): string {
        if (stages == null || stages.length === 0) {
            return "";
        }

        const lines: string[] = [];
        for (const stage of stages) {
            const icon = this.getStageIcon(stage.status, spinnerFrame);
            let line = `\n    ${icon} ${this.getStageLabel(stage)}`;

            if (stage.detail != null) {
                line += `\n        ${chalk.dim(stage.detail)}`;
            }

            // Show logs under the failed stage.
            if (stage.status === "error") {
                const logLines = this.formatTaskLogs(logs, { baseIndent: 8 });
                if (logLines.length > 0) {
                    line += logLines;
                }
                if (stage.error != null) {
                    line += `\n        ${chalk.red(stage.error)}`;
                }
            }

            lines.push(line);
        }

        return lines.join("");
    }

    /**
     * Get the appropriate icon for a stage status.
     *
     * Uses a static arrow (▸) for running stages to avoid visual noise
     * from having multiple spinners (the parent task already has a spinner).
     */
    private getStageIcon(status: TaskStage["status"], _spinnerFrame: string): string {
        switch (status) {
            case "pending":
                return chalk.dim("○");
            case "running":
                return chalk.cyan("▸");
            case "success":
                return chalk.green("✓");
            case "error":
                return chalk.red("✗");
            case "skipped":
                return chalk.dim("○");
            default:
                assertNever(status);
        }
    }

    /**
     * Get the formatted label for a stage based on its status.
     * Uses the appropriate label from the stage's labels map.
     */
    private getStageLabel(stage: TaskStage): string {
        const label = stage.labels[stage.status] ?? stage.labels.pending;
        switch (stage.status) {
            case "pending":
                return chalk.dim(label);
            case "running":
                return chalk.cyan(label);
            case "success":
                return label;
            case "error":
                return chalk.red(label);
            case "skipped":
                return chalk.dim(label);
            default:
                assertNever(stage.status);
        }
    }

    /**
     * Format task logs for display.
     *
     * @param logs - The logs to format
     * @param options - Formatting options
     * @param options.baseIndent - Number of spaces for base indentation (default: 8 for stage nesting)
     */
    private formatTaskLogs(logs: TaskLog[] | undefined, options?: { baseIndent?: number }): string {
        if (logs == null || logs.length === 0) {
            return "";
        }

        const baseIndent = options?.baseIndent ?? 8;
        const indentStr = " ".repeat(baseIndent);

        // In TTY mode (interactive), limit logs to avoid overwhelming the display.
        // In CI/non-TTY mode, show all logs since the console can handle scrolling.
        const shouldLimit = this.context.isTTY;

        // Filter out debug logs containing URLs in TTY mode - they cause rendering
        // issues in IDE terminals. These logs are still written to the log file.
        const filteredLogs = shouldLimit
            ? logs.filter((log) => log.level !== "debug" || !TaskGroup.URL_PATTERN.test(log.message))
            : logs;

        const logsToShow =
            shouldLimit && filteredLogs.length > TaskGroup.MAX_DISPLAYED_LOGS_TTY
                ? filteredLogs.slice(-TaskGroup.MAX_DISPLAYED_LOGS_TTY)
                : filteredLogs;
        const hiddenCount = logs.length - logsToShow.length;

        const formattedLogs = logsToShow
            .map((log) => {
                switch (log.level) {
                    case "debug": {
                        // For debug logs, truncate to prevent line wrapping in TTY mode.
                        const maxMessageLength = shouldLimit ? this.getMaxLogMessageLength() : Infinity;
                        const message = shouldLimit ? this.truncateMessage(log.message, maxMessageLength) : log.message;
                        const icon = chalk.dim("•");
                        return `\n${indentStr}${icon} ${chalk.dim(message)}`;
                    }
                    case "warn":
                        return formatMultilineText({
                            text: log.message,
                            colorFn: chalk.yellow.bind(chalk),
                            icon: chalk.yellow("⚠"),
                            baseIndent,
                            continuationIndent: baseIndent + 2
                        });
                    case "error":
                        return formatMultilineText({
                            text: log.message,
                            colorFn: chalk.red.bind(chalk),
                            icon: chalk.red("✗"),
                            baseIndent,
                            continuationIndent: baseIndent + 2
                        });
                    default:
                        assertNever(log.level);
                }
            })
            .join("");

        if (hiddenCount > 0) {
            return `\n${indentStr}${chalk.dim(`... ${hiddenCount} earlier logs hidden ...`)}${formattedLogs}`;
        }

        return formattedLogs;
    }

    /**
     * Maximum characters for a log message line in TTY mode.
     */
    private getMaxLogMessageLength(): number {
        const terminalWidth = this.stream.columns ?? 80;
        // Reserve space for indent + icon prefix + some margin
        return Math.max(40, terminalWidth - 16);
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
