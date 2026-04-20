import { Log, logErrorMessage } from "@fern-api/cli-logger";
import { addPrefixToString } from "@fern-api/core-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import {
    CliError,
    CreateInteractiveTaskParams,
    Finishable,
    InteractiveTaskContext,
    PosthogEvent,
    Startable,
    TaskAbortSignal,
    TaskContext,
    TaskResult
} from "@fern-api/task-context";

import chalk from "chalk";

import { reportError } from "../telemetry/reportError.js";

export declare namespace TaskContextImpl {
    export interface Init {
        logImmediately: (logs: Log[]) => void;
        takeOverTerminal: (run: () => void | Promise<void>) => Promise<void>;
        logPrefix?: string;
        /**
         * Optional title shown by `TtyAwareLogger` as the heading of this task's frame
         * (e.g. the API workspace name). Falls back to no title when omitted.
         */
        title?: string;
        /**
         * called when this task or any subtask finishes
         */
        onResult?: (result: TaskResult) => void;
        shouldBufferLogs: boolean;
        instrumentPostHogEvent: (event: PosthogEvent) => void;
        captureException?: (error: unknown, code?: CliError.Code) => void;
    }
}

export class TaskContextImpl implements Startable<TaskContext>, Finishable, TaskContext {
    protected result = TaskResult.Success;
    protected logImmediately: (logs: Log[]) => void;
    protected logPrefix: string;
    public readonly title: string | undefined;
    protected subtasks: InteractiveTaskContextImpl[] = [];
    private shouldBufferLogs: boolean;
    private bufferedLogs: Log[] = [];
    protected status: "notStarted" | "running" | "finished" = "notStarted";
    private onResult: ((result: TaskResult) => void) | undefined;
    private instrumentPostHogEventImpl: (event: PosthogEvent) => void;
    private captureExceptionImpl?: (error: unknown, code?: CliError.Code) => void;
    public constructor({
        logImmediately,
        logPrefix,
        title,
        takeOverTerminal,
        onResult,
        shouldBufferLogs,
        instrumentPostHogEvent,
        captureException
    }: TaskContextImpl.Init) {
        this.logImmediately = logImmediately;
        this.logPrefix = logPrefix ?? "";
        this.title = title;
        this.takeOverTerminal = takeOverTerminal;
        this.onResult = onResult;
        this.shouldBufferLogs = shouldBufferLogs;
        this.instrumentPostHogEventImpl = instrumentPostHogEvent;
        this.captureExceptionImpl = captureException;
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

    public failAndThrow(message?: string, error?: unknown, options?: { code?: CliError.Code }): never {
        this.failWithoutThrowing(message, error, options);
        this.finish();
        throw new TaskAbortSignal();
    }

    public failWithoutThrowing(message?: string, error?: unknown, options?: { code?: CliError.Code }): void {
        this.result = TaskResult.Failure;
        if (error instanceof TaskAbortSignal) {
            return;
        }
        logErrorMessage({ message, error, logger: this.logger });
        reportError(this, error, { ...options, message });
    }

    public captureException(error: unknown, code?: CliError.Code): void {
        this.captureExceptionImpl?.(error, code);
    }

    public getResult(): TaskResult {
        return this.result;
    }

    public instrumentPostHogEvent(event: PosthogEvent): void {
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
            instrumentPostHogEvent: (event) => this.instrumentPostHogEventImpl(event),
            captureException: this.captureExceptionImpl
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

        // The icon already carries its own trailing separator (spinner frames come out of ora
        // with a trailing space; static icons add one explicitly). Don't append extra padding.
        return addPrefixToString({
            prefix: this.getIcon({ spinner }),
            content: lines.join("\n")
        });
    }

    public printInteractiveTasks({ spinner }: { spinner: string }): string {
        return this.print({ spinner });
    }

    /**
     * Tasks with subtasks (e.g. a generator group whose children are individual generators)
     * render with a disclosure-triangle glyph instead of the leaf check/x/spinner, so the
     * tree shape is legible at a glance. Leaves keep the existing per-status glyphs.
     *
     * Every branch returns a string ending in a trailing space so the caller doesn't need
     * to pad — `spinner` from ora already includes one, and static glyphs add one explicitly.
     */
    private getIcon({ spinner }: { spinner: string }): string {
        const hasChildren = this.subtasks.length > 0;
        switch (this.status) {
            case "notStarted":
                return hasChildren ? chalk.dim("▸ ") : chalk.dim("◦ ");
            case "running":
                return hasChildren ? chalk.cyan("▾ ") : spinner;
            case "finished":
                switch (this.getResult()) {
                    case TaskResult.Success:
                        return hasChildren ? chalk.green("▾ ") : chalk.green("✓ ");
                    case TaskResult.Failure:
                        return hasChildren ? chalk.red("▾ ") : chalk.red("x ");
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
