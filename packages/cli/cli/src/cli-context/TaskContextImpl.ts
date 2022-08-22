import { Logger, LogLevel } from "@fern-api/logger";
import {
    CreateInteractiveTaskParams,
    FinishableInteractiveTaskContext,
    InteractiveTaskContext,
    StartableInteractiveTaskContext,
    TaskContext,
    TaskResult,
    TASK_FAILURE,
} from "@fern-api/task-context";
import chalk from "chalk";
import { addPrefixToLog } from "./addPrefixToLog";
import { Log } from "./Log";

export declare namespace TaskContextImpl {
    export interface Init {
        log: (logs: Log[]) => void;
        logPrefix?: string;
    }
}

export class TaskContextImpl implements TaskContext {
    protected result = TaskResult.Success;
    protected log: (logs: Log[]) => void;
    protected logPrefix: string;
    protected subtasks: InteractiveTaskContextImpl[] = [];
    private logs: Log[] = [];

    public constructor({ log, logPrefix }: TaskContextImpl.Init) {
        this.log = log;
        this.logPrefix = logPrefix ?? "";
    }

    public fail(message?: string): TASK_FAILURE {
        if (message != null) {
            this.logger.error(message);
        }
        this.result = TaskResult.Failure;
        return TASK_FAILURE;
    }

    public getResult(): TaskResult {
        return this.result;
    }

    public finish(): void {
        this.log(this.logs);
    }

    protected addLog(log: Log): void {
        this.logs.push({
            ...log,
            content: addPrefixToLog({
                prefix: `${this.logPrefix} `,
                content: log.content,
            }),
        });
    }

    public get logger(): Logger {
        return {
            debug: (content) => {
                this.addLog({ content, level: LogLevel.Debug });
            },
            info: (content) => {
                this.addLog({ content, level: LogLevel.Info });
            },
            warn: (content) => {
                this.addLog({ content, level: LogLevel.Warn });
            },
            error: (content) => {
                this.addLog({ content, level: LogLevel.Error });
            },
            log: (content, level) => {
                this.addLog({ content, level });
            },
        };
    }

    public addInteractiveTask({ name, subtitle }: CreateInteractiveTaskParams): StartableInteractiveTaskContext {
        const subtask = new InteractiveTaskContextImpl({
            name,
            subtitle,
            log: (content) => this.log(content),
            logPrefix: `${this.logPrefix} ${chalk.blackBright(name)}`,
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
    implements StartableInteractiveTaskContext, FinishableInteractiveTaskContext
{
    private name: string;
    private subtitle: string | undefined;
    private status: "notStarted" | "running" | "finished" = "notStarted";

    constructor({ name, subtitle, ...superArgs }: InteractiveTaskContextImpl.Init) {
        super(superArgs);
        this.name = name;
        this.subtitle = subtitle;
    }

    public setSubtitle(subtitle: string | undefined): void {
        this.subtitle = subtitle;
    }

    public start(): FinishableInteractiveTaskContext {
        this.status = "running";
        this.addLog({
            content: "Started.",
            level: LogLevel.Info,
            omitOnTTY: true,
        });
        return this;
    }

    public isStarted(): boolean {
        return this.status !== "notStarted";
    }

    public finish(): void {
        if (this.result === TaskResult.Success) {
            this.addLog({
                content: "Finished.",
                level: LogLevel.Info,
                omitOnTTY: true,
            });
        } else {
            this.addLog({
                content: "Failed.",
                level: LogLevel.Error,
                omitOnTTY: true,
            });
        }
        this.status = "finished";
        super.finish();
    }

    public isFinished(): boolean {
        return this.status === "finished";
    }

    public print({ spinner }: { spinner: string }): string {
        const lines = [this.name];
        if (this.subtitle != null) {
            lines.push(chalk.dim(this.subtitle));
        }
        lines.push(...this.subtasks.map((subtask) => subtask.print({ spinner })));

        return addPrefixToLog({
            prefix: `${this.getIcon({ spinner }).padEnd(spinner.length)} `,
            content: lines.join("\n"),
        });
    }

    public printInteractiveTasks({ spinner }: { spinner: string }): string {
        return this.print({ spinner });
    }

    private getIcon({ spinner }: { spinner: string }): string {
        if (!this.isFinished()) {
            return spinner;
        }
        switch (this.getResult()) {
            case TaskResult.Success:
                return chalk.green("✓");
            case TaskResult.Failure:
                return chalk.red("x");
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
