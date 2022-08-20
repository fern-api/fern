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

export interface Logger {
    debug: (value: string) => void;
    info: (value: string) => void;
    warn: (value: string) => void;
    error: (value: string) => void;
    log: (value: string, level: LogLevel) => void;
}

export enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}
