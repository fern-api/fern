// HACKHACK: copied from cli folder
import chalk from "chalk";

import { addPrefixToString } from "@fern-api/core-utils";
import { LogLevel, createLogger } from "@fern-api/logger";
import {
    CreateInteractiveTaskParams,
    FernCliError,
    Finishable,
    InteractiveTaskContext,
    PosthogEvent,
    Startable,
    TaskContext,
    TaskResult
} from "@fern-api/task-context";

import { Log } from "./Log";
import { logErrorMessage } from "./logErrorMessage";

export declare namespace TaskContextImpl {
    export interface Init {
        logImmediately: (logs: Log[]) => void;
        takeOverTerminal: (run: () => void | Promise<void>) => Promise<void>;
        logPrefix?: string;
        /**
         * called when this task or any subtask finishes
         */
        onResult?: (result: TaskResult) => void;
        shouldBufferLogs: boolean;
        instrumentPostHogEvent: (event: PosthogEvent) => Promise<void>;
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
    private instrumentPostHogEventImpl: (event: PosthogEvent) => Promise<void>;
    public constructor({
        logImmediately,
        logPrefix,
        takeOverTerminal,
        onResult,
        shouldBufferLogs,
        instrumentPostHogEvent
    }: TaskContextImpl.Init) {
        this.logImmediately = logImmediately;
        this.logPrefix = logPrefix ?? "";
        this.takeOverTerminal = takeOverTerminal;
        this.onResult = onResult;
        this.shouldBufferLogs = shouldBufferLogs;
        this.instrumentPostHogEventImpl = instrumentPostHogEvent;
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

    public failAndThrow(message?: string, error?: unknown): never {
        this.failWithoutThrowing(message, error);
        this.finish();
        throw new FernCliError();
    }

    public failWithoutThrowing(message?: string, error?: unknown): void {
        logErrorMessage({ message, error, logger: this.logger });
        this.result = TaskResult.Failure;
    }

    public getResult(): TaskResult {
        return this.result;
    }

    public async instrumentPostHogEvent(event: PosthogEvent): Promise<void> {
        this.instrumentPostHogEventImpl(event);
    }

    protected logAtLevel(level: LogLevel, ...parts: string[]): void {
        this.logAtLevelWithOverrides(level, parts);
    }

    protected logAtLevelWithOverrides(level: LogLevel, parts: string[], overrides: Pick<Log, "omitOnTTY"> = {}): void {
        this.log({
            parts,
            level,
            time: new Date(),
            ...overrides
        });
    }

    protected log(log: Log): void {
        this.bufferedLogs.push({
            ...log,
            prefix: this.logPrefix
        });
        if (!this.shouldBufferLogs) {
            this.flushLogs();
        }
    }

    protected flushLogs(): void {
        this.logImmediately(this.bufferedLogs);
        this.bufferedLogs = [];
    }

    public readonly logger = createLogger(this.logAtLevel.bind(this));

    public addInteractiveTask({ name, subtitle }: CreateInteractiveTaskParams): Startable<InteractiveTaskContext> {
        const subtask = new InteractiveTaskContextImpl({
            name,
            subtitle,
            logImmediately: (content) => this.logImmediately(content),
            logPrefix: `${this.logPrefix}${chalk.blackBright(name)} `,
            takeOverTerminal: this.takeOverTerminal,
            onResult: this.onResult,
            shouldBufferLogs: this.shouldBufferLogs,
            instrumentPostHogEvent: async (event) => await this.instrumentPostHogEventImpl(event)
        });
        this.subtasks.push(subtask);
        return subtask;
    }

    public async runInteractiveTask(
        params: CreateInteractiveTaskParams,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ): Promise<boolean> {
        const subtask = this.addInteractiveTask(params).start();
        try {
            await run(subtask);
        } catch (error) {
            subtask.failWithoutThrowing(undefined, error);
        } finally {
            subtask.finish();
        }
        return subtask.getResult() === TaskResult.Success;
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
        this.logAtLevelWithOverrides(LogLevel.Info, ["Started."], {
            omitOnTTY: true
        });
        this.flushLogs();
        return this;
    }

    public isStarted(): boolean {
        return this.status !== "notStarted";
    }

    public finish(): void {
        if (this.result === TaskResult.Success) {
            this.logAtLevelWithOverrides(LogLevel.Info, ["Finished."], {
                omitOnTTY: true
            });
        } else {
            this.logAtLevelWithOverrides(LogLevel.Error, ["Failed."], {
                omitOnTTY: true
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
            content: lines.join("\n")
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
