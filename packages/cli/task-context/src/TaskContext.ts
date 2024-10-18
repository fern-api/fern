import { Logger } from "@fern-api/logger";

export interface TaskContext {
    logger: Logger;
    flushLogs: () => void;
    takeOverTerminal: (run: () => void | Promise<void>) => Promise<void>;
    failAndThrow: (message?: string, error?: unknown) => never;
    failWithoutThrowing: (message?: string, error?: unknown) => void;
    getResult: () => TaskResult;
    addInteractiveTask: (params: CreateInteractiveTaskParams) => Startable<InteractiveTaskContext>;
    runInteractiveTask: (
        params: CreateInteractiveTaskParams,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ) => Promise<boolean>;
    instrumentPostHogEvent: (event: PosthogEvent) => Promise<void>;
    clearTasks: () => void;
}

export interface InteractiveTaskContext extends TaskContext {
    setSubtitle: (subtitle: string | undefined) => void;
    getOutput: () => string | undefined;
    setOutput: (output: string) => void;
    startProgress: (total: number, start: number) => void;
    updateProgress: (progress: number) => void;
    finishProgress: () => void;
}

export interface CreateInteractiveTaskParams {
    name: string;
    useProgressBar?: boolean;
    subtitle?: string;
    taskType?: "prompt" | "worker";
    silent?: boolean;
}

export interface PosthogEvent {
    orgId?: string;
    command?: string;
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
