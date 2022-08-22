import { Logger, LogLevel } from "@fern-api/logger";
import {
    CreateInteractiveTaskParams,
    FinishableInteractiveTaskContext,
    InteractiveTaskContext,
    TaskContext,
    TaskResult,
} from "@fern-api/task-context";
import chalk from "chalk";
import { addPrefixToLog } from "./addPrefixToLog";
import { LogWithLevel } from "./LogWithLevel";

export declare namespace TaskContextImpl {
    export interface Init {
        log: (logs: LogWithLevel[]) => void;
        logPrefix?: string;
    }
}

export class TaskContextImpl implements TaskContext {
    protected result = TaskResult.Success;
    protected log: (logs: LogWithLevel[]) => void;
    protected logPrefix: string;
    protected subtasks: InteractiveTaskContextImpl[] = [];
    private logs: LogWithLevel[] = [];

    public constructor({ log, logPrefix }: TaskContextImpl.Init) {
        this.log = log;
        this.logPrefix = logPrefix ?? "";
    }

    public fail(): void {
        this.result = TaskResult.Failure;
    }

    public getResult(): TaskResult {
        return this.result;
    }

    public finish(): void {
        this.log(this.logs);
    }

    private addLog(content: string, level: LogLevel): void {
        this.logs.push({
            content: addPrefixToLog({
                prefix: this.logPrefix,
                content,
            }),
            level,
        });
    }

    public get logger(): Logger {
        return {
            debug: (content) => {
                this.addLog(content, LogLevel.Debug);
            },
            info: (content) => {
                this.addLog(content, LogLevel.Info);
            },
            warn: (content) => {
                this.addLog(content, LogLevel.Warn);
            },
            error: (content) => {
                this.addLog(content, LogLevel.Error);
            },
            log: (content, level) => {
                this.addLog(content, level);
            },
        };
    }

    public addInteractiveTask({ name, subtitle }: CreateInteractiveTaskParams): FinishableInteractiveTaskContext {
        const subtask = new InteractiveTaskContextImpl({
            name,
            subtitle,
            log: (content) => this.log(content),
            logPrefix: `${this.logPrefix}${chalk.dim(`[${name}]`)} `,
        });
        this.subtasks.push(subtask);
        return subtask;
    }

    public async runInteractiveTask(
        params: CreateInteractiveTaskParams,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ): Promise<void> {
        const subtask = this.addInteractiveTask(params);
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

export class InteractiveTaskContextImpl extends TaskContextImpl implements FinishableInteractiveTaskContext {
    private name: string;
    private subtitle: string | undefined;
    private isRunning = true;

    constructor({ name, subtitle, ...superArgs }: InteractiveTaskContextImpl.Init) {
        super(superArgs);
        this.name = name;
        this.subtitle = subtitle;
    }

    public setSubtitle(subtitle: string | undefined): void {
        this.subtitle = subtitle;
    }

    public finish(): void {
        super.finish();
        this.isRunning = false;
    }

    public isFinished(): boolean {
        return !this.isRunning;
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
