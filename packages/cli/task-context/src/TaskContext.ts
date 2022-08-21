import { Logger } from "@fern-api/logger";

export interface TaskContext {
    readonly logger: Logger;
}

export interface InteractiveTaskContext extends TaskContext {
    readonly setSubtitle: (subtitle: string | undefined) => void;
    readonly addInteractiveTask: (params: CreateInteractiveTaskParams) => Promise<void>;
}

export interface CreateInteractiveTaskParams {
    name: string;
    subtitle?: string;
    run: (task: InteractiveTaskContext) => TaskResult | Promise<TaskResult>;
}

export enum TaskResult {
    Success,
    Failure,
}
