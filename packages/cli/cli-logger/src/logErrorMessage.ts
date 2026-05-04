import { Logger, LogLevel } from "@fern-api/logger";
import { TaskAbortSignal } from "@fern-api/task-context";
import chalk from "chalk";

const USE_NODE_18_OR_ABOVE_MESSAGE = "The Fern CLI requires Node 18+ or above.";

export function logErrorMessage({
    message,
    error,
    logger,
    logLevel = LogLevel.Error
}: {
    message: string | undefined;
    error: unknown;
    logger: Logger;
    logLevel?: LogLevel;
}): void {
    if (message != null) {
        logger.log(logLevel, message);
    } else if (error == null) {
        return;
    }

    // thrower is responsible for logging, so we don't need to log the error's message too
    if (error instanceof TaskAbortSignal) {
        return;
    }

    if (error != null) {
        const errorMessage = convertErrorToString(error);
        if (errorMessage != null) {
            logger.log(logLevel, errorMessage);
        }
    }

    const stack = error instanceof Error ? error.stack : new Error(JSON.stringify(error)).stack;
    if (stack != null) {
        logger.debug(chalk.red(stack));
    }
}

function convertErrorToString(error: unknown): string | undefined {
    if (typeof error === "string") {
        return error;
    }
    if (error instanceof Error) {
        if ((error as Error)?.message?.includes("globalThis")) {
            return USE_NODE_18_OR_ABOVE_MESSAGE;
        }

        return error.message;
    }
    return undefined;
}
