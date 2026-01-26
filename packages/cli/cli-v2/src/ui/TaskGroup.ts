import { TtyAwareLogger } from "@fern-api/cli-logger";
import { assertNever } from "@fern-api/core-utils";
import chalk from "chalk";
import { Context } from "../context/Context";
import type { Task } from "./Task";
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
 * TaskGroup just tracks task state and provides formatted output via printInteractiveTasks().
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
    public start(header?: { title: string; subtitle?: string }): this {
        this.startTime = Date.now();

        if (header != null) {
            this.stream.write("\n");
            this.stream.write(`${chalk.cyan("◆")} ${chalk.bold(header.title)}\n`);
            if (header.subtitle != null) {
                this.stream.write(`  ${chalk.dim(header.subtitle)}\n`);
            }
            this.stream.write("\n");
        }

        return this;
    }

    /**
     * Update a task's status
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
            this.registerIfNeeded();
        }

        if (prevStatus === "running" && (task.status === "success" || task.status === "error")) {
            task.endTime = Date.now();
        }

        return this;
    }

    /**
     * Register this TaskGroup with TtyAwareLogger for coordinated rendering.
     * Only registers once.
     */
    private registerIfNeeded(): void {
        if (this.isRegistered) {
            return;
        }
        this.isRegistered = true;
        this.ttyAwareLogger.registerTask(this);
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

        // Return just the task lines - TtyAwareLogger adds the box frame
        return lines.join("\n");
    }

    private formatTaskLine(task: Task, spinnerFrame: string): string | undefined {
        const name = chalk.bold(task.name);
        switch (task.status) {
            case "pending":
                return undefined;
            case "running": {
                const step = task.currentStep != null ? `  ${chalk.dim(task.currentStep)}` : "";
                return `${spinnerFrame} ${name}${step}`;
            }
            case "success": {
                const duration = this.formatTaskDuration(task);
                const outputLine = task.output != null ? `\n    ${chalk.dim("→")} ${chalk.cyan(task.output)}` : "";
                return `${chalk.green("✓")} ${name}${duration}${outputLine}`;
            }
            case "error": {
                const duration = this.formatTaskDuration(task);
                const errorLines = this.formatMultilineError(task.error);
                return `${chalk.red("x")} ${name}${duration}${errorLines}`;
            }
            case "skipped":
                return `${chalk.dim("○")} ${chalk.dim(name)} ${chalk.dim("(skipped)")}`;
            default:
                assertNever(task.status);
        }
    }

    private formatTaskDuration(task: Task): string {
        if (task.startTime != null && task.endTime != null) {
            return chalk.dim(` ${this.formatDuration(task.endTime - task.startTime)}`);
        }
        return "";
    }

    /**
     * Format a potentially multiline error message with proper indentation.
     */
    private formatMultilineError(error: string | undefined): string {
        if (error == null) {
            return "";
        }
        // Split error into lines and format each with proper indentation
        const lines = error.split("\n").filter((line) => line.trim().length > 0);
        return lines.map((line) => `\n    ${chalk.red(line)}`).join("");
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

        // Finish the TtyAwareLogger to clean up cursor/display
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
        this.stream.write("\n");

        return { successCount, failedCount, duration };
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
}
