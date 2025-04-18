// HACKHACK: copied from cli folder
import chalk from "chalk";

import { LogLevel, Logger } from "@fern-api/logger";
import { FernCliError } from "@fern-api/task-context";

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
    if (error instanceof FernCliError) {
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
        return error.message;
    }
    return undefined;
}
