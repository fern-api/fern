import { CONSOLE_LOGGER, Logger } from "@fern-api/logger";

import { FernCliError } from "./FernCliError";
import { TaskContext, TaskResult } from "./TaskContext";

export function createMockTaskContext({ logger = CONSOLE_LOGGER }: { logger?: Logger } = {}): TaskContext {
    const context = {
        logger,
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
            throw new FernCliError();
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
        instrumentPostHogEvent: () => {
            throw new Error("Not implemented");
        }
    };
    return context;
}
