import { CONSOLE_LOGGER, NOOP_LOGGER } from "@fern-api/logger";
import { FernCliError } from "./FernCliError";
import { TaskContext, TaskResult } from "./TaskContext";

export function createMockTaskContext({
    shouldSuppressOutput = false,
}: { shouldSuppressOutput?: boolean } = {}): TaskContext {
    const context = {
        logger: shouldSuppressOutput ? NOOP_LOGGER : CONSOLE_LOGGER,
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
            throw new FernCliError(message);
        },
        failWithoutThrowing: (message?: string, error?: unknown) => {
            // in mock contexts, any failures should throw
            context.failAndThrow(message, error);
        },
        getResult: () => TaskResult.Success,
        addInteractiveTask: () => {
            throw new Error("Not implemented");
        },
        runInteractiveTask: () => {
            throw new Error("Not implemented");
        },
    };
    return context;
}
