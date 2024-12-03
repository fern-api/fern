import { NopLogger } from "./NopLogger";

export enum TaskResult {
    Success,
    Failure
}

export function createTaskContext() {
    const context = {
        logger: new NopLogger(),
        takeOverTerminal: () => {
            throw new Error("unimplemented");
        },
        failAndThrow: (message?: string, error?: unknown) => {
            const parts = [];
            if (message != null) {
                parts.push(message);
            }
            if (error != null) {
                parts.push(JSON.stringify(error));
            }
            if (parts.length > 0) {
                context.logger.error(...parts);
            }
            throw new Error("unimplemented");
        },
        failWithoutThrowing: (message?: string, error?: unknown) => {
            context.failAndThrow(message, error);
        },
        getResult: () => TaskResult.Success,
        addInteractiveTask: () => {
            throw new Error("unimplemented");
        },
        runInteractiveTask: () => {
            throw new Error("unimplemented");
        },
        instrumentPostHogEvent: () => {
            throw new Error("unimplemented");
        }
    };
    return context;
}
