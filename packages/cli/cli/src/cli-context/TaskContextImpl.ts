import { addPrefixToString } from "@fern-api/core-utils";
import { Logger, LogLevel } from "@fern-api/logger";
import {
    CreateInteractiveTaskParams,
    Finishable,
    InteractiveTaskContext,
    Startable,
    TaskContext,
    TaskResult,
    TASK_FAILURE,
} from "@fern-api/task-context";
import chalk from "chalk";
import { constructErrorMessage } from "./constructErrorMessage";
import { Log } from "./Log";

export declare namespace TaskContextImpl {
    export interface Init {
        log: (logs: Log[]) => void;
        takeOverTerminal: (run: () => void | Promise<void>) => Promise<void>;
        logPrefix?: string;
        /**
         * called when this task or any subtask finishes
         */
        onResult?: (result: TaskResult) => void;
        shouldBufferLogs: boolean;
    }
}

export class TaskContextImpl implements Startable<TaskContext>, Finishable, TaskContext {
    protected result = TaskResult.Success;
    protected logImmediately: (logs: Log[]) => void;
    protected logPrefix: string;
    protected subtasks: InteractiveTaskContextImpl[] = [];
    private shouldBufferLogs: boolean;
    private bufferedLogs: Log[] = [];
    protected status: "notStarted" | "running" | "finished" = "notStarted";
    private onResult: ((result: TaskResult) => void) | undefined;

    public constructor({ log, logPrefix, takeOverTerminal, onResult, shouldBufferLogs }: TaskContextImpl.Init) {
        this.logImmediately = log;
        this.logPrefix = logPrefix ?? "";
        this.takeOverTerminal = takeOverTerminal;
        this.onResult = onResult;
        this.shouldBufferLogs = shouldBufferLogs;
    }

    public start(): Finishable & TaskContext {
        this.status = "running";
        return this;
    }

    public isStarted(): boolean {
        return this.status !== "notStarted";
    }

    public finish(): void {
        this.status = "finished";
        this.flushLogs();
        this.onResult?.(this.getResult());
    }

    public isFinished(): boolean {
        return this.status === "finished";
    }

    public takeOverTerminal: (run: () => void | Promise<void>) => Promise<void>;

    public fail(message?: string, error?: unknown): TASK_FAILURE {
        const errorMessage = constructErrorMessage({ message, error });
        if (errorMessage != null) {
            this.logger.error(errorMessage);
        }
        this.result = TaskResult.Failure;
        return TASK_FAILURE;
    }

    public getResult(): TaskResult {
        return this.result;
    }

    protected log(log: Log): void {
        this.bufferedLogs.push({
            ...log,
            prefix: this.logPrefix,
        });
        if (!this.shouldBufferLogs) {
            this.flushLogs();
        }
    }

    protected flushLogs(): void {
        this.logImmediately(this.bufferedLogs);
        this.bufferedLogs = [];
    }

    public get logger(): Logger {
        return {
            debug: (...args) => {
                this.log({ args, level: LogLevel.Debug });
            },
            info: (...args) => {
                this.log({ args, level: LogLevel.Info });
            },
            warn: (...args) => {
                this.log({ args, level: LogLevel.Warn });
            },
            error: (...args) => {
                this.log({ args, level: LogLevel.Error });
            },
            log: (level, ...args) => {
                this.log({ args, level });
            },
        };
    }

    public addInteractiveTask({ name, subtitle }: CreateInteractiveTaskParams): Startable<InteractiveTaskContext> {
        const subtask = new InteractiveTaskContextImpl({
            name,
            subtitle,
            log: (content) => this.logImmediately(content),
            logPrefix: `${this.logPrefix}${chalk.blackBright(name)} `,
            takeOverTerminal: this.takeOverTerminal,
            onResult: this.onResult,
            shouldBufferLogs: this.shouldBufferLogs,
        });
        this.subtasks.push(subtask);
        return subtask;
    }

    public async runInteractiveTask(
        params: CreateInteractiveTaskParams,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ): Promise<void> {
        const subtask = this.addInteractiveTask(params).start();
        await run(subtask);
        subtask.finish();
    }

    public printInteractiveTasks({ spinner }: { spinner: string }): string {
        return this.subtasks.map((subtask) => subtask.print({ spinner })).join("\n");
    }
}

/**
 * InteractiveTaskContextImpl is defined in this file because
 * InteractiveTaskContextImpl and TaskContextImpl are co-dependent
 */

export declare namespace InteractiveTaskContextImpl {
    export interface Init extends TaskContextImpl.Init {
        name: string;
        subtitle: string | undefined;
    }
}

export class InteractiveTaskContextImpl
    extends TaskContextImpl
    implements Startable<InteractiveTaskContext>, Finishable, InteractiveTaskContext
{
    private name: string;
    private subtitle: string | undefined;

    constructor({ name, subtitle, ...superArgs }: InteractiveTaskContextImpl.Init) {
        super(superArgs);
        this.name = name;
        this.subtitle = subtitle;
    }

    public start(): Finishable & InteractiveTaskContext {
        super.start();
        this.log({
            args: ["Started."],
            level: LogLevel.Info,
            omitOnTTY: true,
        });
        this.flushLogs();
        return this;
    }

    public isStarted(): boolean {
        return this.status !== "notStarted";
    }

    public finish(): void {
        if (this.result === TaskResult.Success) {
            this.log({
                args: ["Finished."],
                level: LogLevel.Info,
                omitOnTTY: true,
            });
        } else {
            this.log({
                args: ["Failed."],
                level: LogLevel.Error,
                omitOnTTY: true,
            });
        }
        super.finish();
    }

    public setSubtitle(subtitle: string | undefined): void {
        this.subtitle = subtitle;
    }

    public print({ spinner }: { spinner: string }): string {
        const lines = [this.name];
        if (this.subtitle != null) {
            lines.push(chalk.dim(this.subtitle));
        }
        lines.push(...this.subtasks.map((subtask) => subtask.print({ spinner })));

        return addPrefixToString({
            prefix: `${this.getIcon({ spinner }).padEnd(spinner.length)} `,
            content: lines.join("\n"),
        });
    }

    public printInteractiveTasks({ spinner }: { spinner: string }): string {
        return this.print({ spinner });
    }

    private getIcon({ spinner }: { spinner: string }): string {
        switch (this.status) {
            case "notStarted":
                return chalk.dim("◦");
            case "running":
                return spinner;
            case "finished":
                switch (this.getResult()) {
                    case TaskResult.Success:
                        return chalk.green("✓");
                    case TaskResult.Failure:
                        return chalk.red("x");
                }
        }
    }

    public getResult(): TaskResult {
        if (this.result === TaskResult.Failure) {
            return TaskResult.Failure;
        }
        for (const subtask of this.subtasks) {
            if (subtask.getResult() === TaskResult.Failure) {
                return TaskResult.Failure;
            }
        }
        return TaskResult.Success;
    }
}
