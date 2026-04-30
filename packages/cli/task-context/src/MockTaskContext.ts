import { CONSOLE_LOGGER, Logger } from "@fern-api/logger";

import { type CliError } from "./CliError.js";
import { TaskAbortSignal } from "./TaskAbortSignal.js";
import { TaskContext, TaskResult } from "./TaskContext.js";

export function createMockTaskContext({ logger = CONSOLE_LOGGER }: { logger?: Logger } = {}): TaskContext {
    const context: TaskContext = {
        logger,
        takeOverTerminal: () => {
            throw new Error("Not implemented");
        },
        failAndThrow: (message?: string, error?: unknown, _options?: { code?: CliError.Code }) => {
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
            throw new TaskAbortSignal();
        },
        failWithoutThrowing: (message?: string, error?: unknown, _options?: { code?: CliError.Code }) => {
            context.failAndThrow(message, error);
        },
        captureException: () => {
            // no-op in mock context
        },
        getResult: () => TaskResult.Success,
        getLastFailureMessage: () => undefined,
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
