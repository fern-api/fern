import { Logger } from "@fern-api/logger";

export interface TaskContext {
    readonly logger: Logger;
    readonly fail: () => void;
    readonly getResult: () => TaskResult;
    readonly addInteractiveTask: (params: CreateInteractiveTaskParams) => FinishableInteractiveTaskContext;
    readonly runInteractiveTask: (
        params: CreateInteractiveTaskParams,
        run: (context: InteractiveTaskContext) => void | Promise<void>
    ) => Promise<void>;
}

export interface InteractiveTaskContext extends TaskContext {
    readonly setSubtitle: (subtitle: string | undefined) => void;
}

export interface FinishableInteractiveTaskContext extends InteractiveTaskContext {
    readonly finish: () => void;
    readonly isFinished: () => boolean;
}

export interface CreateInteractiveTaskParams {
    name: string;
    subtitle?: string;
}

export enum TaskResult {
    Success,
    Failure,
}
