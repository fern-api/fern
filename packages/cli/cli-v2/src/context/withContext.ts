import { LogLevel } from "@fern-api/logger";
import { CliError } from "../errors/CliError";
import { ValidationError } from "../errors/ValidationError";
import { Context } from "./Context";
import type { GlobalArgs } from "./GlobalArgs";

/**
 * Wraps a command handler with context creation and error handling.
 *
 * This centralizes exit logic so command handlers don't have to
 * independently handle errors and call process.exit() directly.
 */
export function withContext<T extends GlobalArgs>(
    handler: (context: Context, args: T) => Promise<void>
): (args: T) => Promise<void> {
    return async (args: T) => {
        const context = createContext(args);
        try {
            await handler(context, args);
            process.exit(0);
        } catch (error) {
            handleError(context, error);
            process.exit(1);
        }
    };
}

function createContext(options: GlobalArgs): Context {
    const logLevel = parseLogLevel(options["log-level"] ?? "info");
    return new Context({
        stdout: process.stdout,
        stderr: process.stderr,
        logLevel
    });
}

/**
 * Handles errors by writing appropriate output to stderr.
 */
function handleError(context: Context, error: unknown): void {
    if (error instanceof ValidationError) {
        for (const issue of error.issues) {
            context.stderr.info(issue.toString());
        }
        return;
    }

    if (error instanceof CliError) {
        // CliErrors are user-facing errors with codes.
        context.stderr.error(error.message);
        return;
    }

    if (error instanceof Error) {
        context.stderr.error(error.message);
        if (error.stack != null) {
            context.stderr.debug(error.stack);
        }
        return;
    }

    context.stderr.error(String(error));
}

function parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
        case "debug":
            return LogLevel.Debug;
        case "info":
            return LogLevel.Info;
        case "warn":
            return LogLevel.Warn;
        case "error":
            return LogLevel.Error;
        default:
            return LogLevel.Info;
    }
}
