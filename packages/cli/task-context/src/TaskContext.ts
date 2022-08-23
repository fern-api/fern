import { Logger } from "@fern-api/logger";

export const TASK_FAILURE = Symbol();
export type TASK_FAILURE = typeof TASK_FAILURE;

export interface TaskContext {
    logger: Logger;
    takeOverTerminal: (run: () => void | Promise<void>) => Promise<void>;
    fail(message?: string, error?: unknown): TASK_FAILURE;
    fail(error: unknown): TASK_FAILURE;
    getResult: () => TaskResult;
    addInteractiveTask: (params: CreateInteractiveTaskParams) => Startable<InteractiveTaskContext>;
    runInteractiveTask: (
        params: CreateInteractiveTaskParams,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ) => Promise<void>;
}

export interface InteractiveTaskContext extends TaskContext {
    setSubtitle: (subtitle: string | undefined) => void;
}

export interface CreateInteractiveTaskParams {
    name: string;
    subtitle?: string;
}

// TODO change to boolean representation
export enum TaskResult {
    Success,
    Failure,
}

export interface Startable<T> {
    start: () => T & Finishable;
    isStarted: () => boolean;
}

export interface Finishable {
    finish: () => void;
    isFinished: () => boolean;
}
