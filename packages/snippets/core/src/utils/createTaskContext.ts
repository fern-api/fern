import { PosthogEvent, TaskContext } from "@fern-api/task-context";

import { NopLogger } from "./NopLogger";

export enum TaskResult {
    Success,
    Failure
}

export function createTaskContext(): TaskContext {
    const context: TaskContext = {
        logger: new NopLogger(),
        takeOverTerminal: async (run: () => void | Promise<void>) => {
            // no-op
        },
        failAndThrow: (_message?: string, _error?: unknown) => {
            throw new Error("unimplemented");
        },
        failWithoutThrowing: (_message?: string, _error?: unknown) => {
            // no-op
        },
        getResult: () => TaskResult.Success,
        addInteractiveTask: () => {
            throw new Error("unimplemented");
        },
        runInteractiveTask: async (_params, _run) => {
            // no-op
            return false;
        },
        instrumentPostHogEvent: async (_event: PosthogEvent) => {
            // no-op
        }
    };
    return context;
}
