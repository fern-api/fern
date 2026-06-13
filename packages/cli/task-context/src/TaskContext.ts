import { Logger } from "@fern-api/logger";

import { type CliError } from "./CliError.js";

export interface CaptureExceptionOptions {
    tags?: Record<string, string>;
    context?: Record<string, Record<string, unknown> | undefined>;
}

export interface TaskFailOptions {
    code?: CliError.Code;
    skipErrorReporting?: boolean;
}

export interface TaskContext {
    logger: Logger;
    takeOverTerminal: (run: () => void | Promise<void>) => Promise<void>;
    failAndThrow: (message?: string, error?: unknown, options?: TaskFailOptions) => never;
    failWithoutThrowing: (message?: string, error?: unknown, options?: TaskFailOptions) => void;
    captureException: (error: unknown, options?: CaptureExceptionOptions) => string | undefined;
    getResult: () => TaskResult;
    /**
     * Returns the most recent message passed to `failAndThrow` / `failWithoutThrowing`,
     * if any. Useful for callers that swallow a `TaskAbortSignal` and still need to
     * surface the original failure reason (e.g. automation summaries).
     */
    getLastFailureMessage: () => string | undefined;
    addInteractiveTask: (params: CreateInteractiveTaskParams) => Startable<InteractiveTaskContext>;
    runInteractiveTask: (
        params: CreateInteractiveTaskParams,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ) => Promise<boolean>;
    instrumentPostHogEvent: (event: PosthogEvent) => void;
}

export interface InteractiveTaskContext extends TaskContext {
    setSubtitle: (subtitle: string | undefined) => void;
}

export interface CreateInteractiveTaskParams {
    name: string;
    subtitle?: string;
}

export interface PosthogEvent {
    orgId?: string;
    command?: string;
    properties?: Record<string | number, unknown>;
}

export interface PosthogAutomationEvent {
    distinctId: string | undefined;
    event: string;
    properties?: Record<string | number, unknown>;
}

// TODO change to boolean representation
export enum TaskResult {
    Success,
    Failure
}

export interface Startable<T> {
    start: () => T & Finishable;
    isStarted: () => boolean;
}

export interface Finishable {
    finish: () => void;
    isFinished: () => boolean;
}
