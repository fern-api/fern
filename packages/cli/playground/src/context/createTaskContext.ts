import { Logger } from "./Logger";

export enum TaskResult {
    Success,
    Failure
}

export function createTaskContext() {
    const context = {
        logger: new Logger(),
        takeOverTerminal: () => {
            throw new Error("Not implemented");
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
            throw new Error("Not implemented");
        },
        failWithoutThrowing: (message?: string, error?: unknown) => {
            context.failAndThrow(message, error);
        },
        getResult: () => TaskResult.Success,
        addInteractiveTask: () => {
            throw new Error("Not implemented");
        },
        runInteractiveTask: () => {
            throw new Error("Not implemented");
        },
        instrumentPostHogEvent: () => {
            throw new Error("Not implemented");
        }
    };
    return context;
}