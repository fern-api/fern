import { CONSOLE_LOGGER } from "@fern-api/logger";
import { FernCliError } from "./FernCliError";
import { TaskContext, TaskResult } from "./TaskContext";

export function createMockTaskContext(): TaskContext {
    let result = TaskResult.Success;
    const context = {
        logger: CONSOLE_LOGGER,
        takeOverTerminal: () => {
            throw new Error("Not implemented");
        },
        failAndThrow: (message?: string, error?: unknown) => {
            context.failWithoutThrowing(message, error);
            throw new FernCliError();
        },
        failWithoutThrowing: (message?: string, error?: unknown) => {
            const parts = [];
            if (message != null) {
                parts.push(message);
            }
            if (error != null) {
                parts.push(error);
            }
            if (parts.length > 0) {
                context.logger.error(...parts);
            }
            result = TaskResult.Failure;
        },
        getResult: () => result,
        addInteractiveTask: () => {
            throw new Error("Not implemented");
        },
        runInteractiveTask: () => {
            throw new Error("Not implemented");
        },
    };
    return context;
}
