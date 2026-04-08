import { createLogger, LOG_LEVELS, Logger, LogLevel } from "@fern-api/logger";
import {
    type CliError,
    type CreateInteractiveTaskParams,
    type Finishable,
    type InteractiveTaskContext,
    type PosthogEvent,
    resolveErrorCode,
    type Startable,
    TaskAbortSignal,
    type TaskContext,
    TaskResult
} from "@fern-api/task-context";

import type { Task } from "../../ui/Task.js";
import type { Context } from "../Context.js";
import { reportError } from "../withContext.js";
import { TaskContextLogger } from "./TaskContextLogger.js";

/**
 * Adapts the CLI context to the legacy TaskContext interface.
 *
 * When a task is provided, logs are written to the task's log display
 * and to the log file via TaskContextLogger.
 *
 * When no task is provided (e.g., during validation), logs are written
 * directly to stderr, filtered by logLevel (defaults to Warn).
 *
 * @param context - The CLI context
 * @param task - Optional task for log file writing
 * @param logLevel - Minimum log level to display. Defaults to Warn (only warnings and errors).
 *                   Pass LogLevel.Info to include info messages (e.g., for device code flow).
 */
export class TaskContextAdapter implements TaskContext {
    private result: TaskResult = TaskResult.Success;
    private readonly context: Context;

    public readonly logger: Logger;

    constructor({ context, task, logLevel = LogLevel.Warn }: { context: Context; task?: Task; logLevel?: LogLevel }) {
        this.context = context;
        if (task != null) {
            this.logger = new TaskContextLogger({ context, task, logLevel });
        } else {
            // When no task is provided, write directly to stderr.
            this.logger = createLogger((level: LogLevel, ...args: string[]) => {
                if (LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(logLevel)) {
                    context.stderr.log(level, ...args);
                }
            });
        }
    }

    public async takeOverTerminal(run: () => void | Promise<void>): Promise<void> {
        await run();
    }

    public failAndThrow(message?: string, error?: unknown, options?: { code?: CliError.Code }): never {
        this.failWithoutThrowing(message, error, options);
        throw new TaskAbortSignal();
    }

    public failWithoutThrowing(message?: string, error?: unknown, options?: { code?: CliError.Code }): void {
        this.result = TaskResult.Failure;
        if (error instanceof TaskAbortSignal) {
            return;
        }
        const fullMessage = this.getFullErrorMessage(message, error);
        if (fullMessage != null) {
            this.logger.error(fullMessage);
        }

        reportError(this.context, error, { ...options, message });
    }

    public captureException(error: unknown, code?: CliError.Code): void {
        const errorCode = resolveErrorCode(error, code);
        this.context.telemetry.captureException(error, { errorCode });
    }

    private getFullErrorMessage(message?: string, error?: unknown): string | undefined {
        const errorDetails = this.formatError(error);
        if (message != null && errorDetails != null) {
            // Avoid stuttering when the message already contains the error details.
            // Legacy callers often pass the same message and error as the second
            // argument.
            return message.includes(errorDetails) ? message : `${message}: ${errorDetails}`;
        }
        return message ?? errorDetails;
    }

    public getResult(): TaskResult {
        return this.result;
    }

    public addInteractiveTask(_params: CreateInteractiveTaskParams): Startable<InteractiveTaskContext> {
        const subtask: InteractiveTaskContext & Startable<InteractiveTaskContext> & Finishable = {
            logger: this.logger,
            takeOverTerminal: this.takeOverTerminal.bind(this),
            failAndThrow: this.failAndThrow.bind(this),
            failWithoutThrowing: this.failWithoutThrowing.bind(this),
            captureException: this.captureException.bind(this),
            getResult: () => this.result,
            addInteractiveTask: this.addInteractiveTask.bind(this),
            runInteractiveTask: this.runInteractiveTask.bind(this),
            instrumentPostHogEvent: this.instrumentPostHogEvent.bind(this),
            setSubtitle: (_subtitle: string | undefined) => {
                // no-op
            },
            start: () => {
                // no-op
                return subtask;
            },
            isStarted: () => true,
            finish: () => {
                // no-op
            },
            isFinished: () => true
        };
        return subtask;
    }

    public async runInteractiveTask(
        params: CreateInteractiveTaskParams,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ): Promise<boolean> {
        const subtask = this.addInteractiveTask(params).start();
        try {
            await run(subtask);
            return true;
        } catch {
            return false;
        }
    }

    public instrumentPostHogEvent(_event: PosthogEvent): void {
        // no-op — v2 uses TelemetryClient.sendEvent directly
    }

    private formatError(error: unknown): string | undefined {
        if (error == null) {
            return undefined;
        }
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === "string") {
            return error;
        }
        if (typeof error === "object") {
            const message = this.extractErrorMessage(error);
            if (message != null) {
                return message;
            }
        }
        try {
            return JSON.stringify(error);
        } catch {
            return String(error);
        }
    }

    /**
     * Attempts to extract a human-readable message from a structured error object.
     *
     * Handles common shapes from the FDR SDK and other API clients, e.g.:
     *   { content: { body: { message: "..." } } }
     *   { body: { message: "..." } }
     *   { message: "..." }
     */
    private extractErrorMessage(error: object): string | undefined {
        const record = error as Record<string, unknown>;

        // { message: "..." }
        if (typeof record.message === "string") {
            return record.message;
        }

        // { body: { message: "..." } }
        if (record.body != null && typeof record.body === "object") {
            const body = record.body as Record<string, unknown>;
            if (typeof body.message === "string") {
                return body.message;
            }
        }

        // { content: { body: { message: "..." } } }
        if (record.content != null && typeof record.content === "object") {
            return this.extractErrorMessage(record.content);
        }

        return undefined;
    }
}
