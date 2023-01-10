import { addPrefixToString } from "@fern-api/core-utils";
import { Logger, LogLevel } from "@fern-api/logger";
import { FernCliError } from "@fern-api/task-context";

export function logErrorMessage({
    message,
    error,
    logger,
    logLevel = LogLevel.Error,
}: {
    message: string | undefined;
    error: unknown;
    logger: Logger;
    logLevel?: LogLevel;
}): void {
    if (message != null) {
        logger.log(logLevel, message);
    }

    if (
        error == null ||
        // thrower is responsible for logging, so we don't need to log here
        error instanceof FernCliError
    ) {
        return;
    }

    const errorMessage = convertErrorToString(error);
    if (errorMessage != null) {
        logger.log(
            logLevel,
            addPrefixToString({
                prefix: "  ",
                content: errorMessage,
                includePrefixOnAllLines: true,
            })
        );
    }

    logger.debug(JSON.stringify(error));
}

function convertErrorToString(error: unknown): string | undefined {
    if (typeof error === "string") {
        return error;
    }
    if (error instanceof Error) {
        return error.stack ?? error.message;
    }
    return undefined;
}
