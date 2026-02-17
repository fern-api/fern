import { LogLevel } from "@fern-api/logger";
import chalk from "chalk";
import { KeyringUnavailableError } from "../auth/errors/KeyringUnavailableError.js";
import { CliError } from "../errors/CliError.js";
import { ValidationError } from "../errors/ValidationError.js";
import { Icons } from "../ui/format.js";
import { Context } from "./Context.js";
import type { GlobalArgs } from "./GlobalArgs.js";

// It's standard to use 128 as the base exit code for signals.
// https://en.wikipedia.org/wiki/Signal_(IPC)
const SIGNAL_EXIT_CODE_BASE = 128;
const SIGINT_EXIT_CODE = SIGNAL_EXIT_CODE_BASE + 2;
const SIGTERM_EXIT_CODE = SIGNAL_EXIT_CODE_BASE + 15;

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

        setupSignalHandler(context);

        try {
            await handler(context, args);
            context.finish();
            process.exit(0);
        } catch (error) {
            handleError(context, error);
            context.finish();
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
            process.stderr.write(`${chalk.red(issue.toString())}\n`);
        }
        return;
    }

    if (error instanceof KeyringUnavailableError) {
        context.stdout.error(`${Icons.error} ${error.message}`);
        return;
    }

    if (error instanceof CliError) {
        if (error.message.length > 0) {
            process.stderr.write(`${chalk.red(error.message)}\n`);
        }
        return;
    }

    if (error instanceof Error) {
        process.stderr.write(`${chalk.red(error.message)}\n`);
        if (error.stack != null && context.logLevel === LogLevel.Debug) {
            process.stderr.write(`${chalk.dim(error.stack)}\n`);
        }
        return;
    }

    process.stderr.write(`${chalk.red(String(error))}\n`);
}

function setupSignalHandler(context: Context): void {
    const onSignal = (exitCode: number): void => {
        context.shutdown();
        context.printLogFilePath(process.stderr);
        process.exit(exitCode);
    };
    process.on("SIGINT", () => onSignal(SIGINT_EXIT_CODE));
    process.on("SIGTERM", () => onSignal(SIGTERM_EXIT_CODE));
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
