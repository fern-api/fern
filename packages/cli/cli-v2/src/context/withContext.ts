import { LogLevel } from "@fern-api/logger";
import { TaskAbortSignal } from "@fern-api/task-context";
import chalk from "chalk";
import { KeyringUnavailableError } from "../auth/errors/KeyringUnavailableError.js";
import { CliError } from "../errors/CliError.js";
import { SourcedValidationError } from "../errors/SourcedValidationError.js";
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
        const context = await createContext(args);
        const startTime = Date.now();
        setupSignalHandler(context);

        try {
            await handler(context, args);
            context.telemetry.sendLifecycleEvent({
                command: context.info.command,
                status: "success",
                durationMs: Date.now() - startTime
            });
            await context.telemetry.flush();
            context.finish();
            await exitGracefully(0);
        } catch (error) {
            if (shouldReportToSentry(error)) {
                context.telemetry.captureException(error);
            }
            context.telemetry.sendLifecycleEvent({
                command: context.info.command,
                status: "error",
                durationMs: Date.now() - startTime,
                errorCode: extractErrorCode(error)
            });
            await context.telemetry.flush();
            handleError(context, error);
            context.finish();
            await exitGracefully(1);
        }
    };
}

async function createContext(options: GlobalArgs): Promise<Context> {
    const logLevel = parseLogLevel(options["log-level"] ?? "info");
    return Context.create({
        stdout: process.stdout,
        stderr: process.stderr,
        logLevel
    });
}

/**
 * Handles errors by writing appropriate output to stderr.
 */
function handleError(context: Context, error: unknown): void {
    if (error instanceof SourcedValidationError) {
        for (const issue of error.issues) {
            process.stderr.write(`${chalk.red(issue.toString())}\n`);
        }
        return;
    }

    if (error instanceof ValidationError) {
        for (const violation of error.violations) {
            const color = violation.severity === "warning" ? chalk.yellow : chalk.red;
            process.stderr.write(`${color(`${violation.relativeFilepath}: ${violation.message}`)}\n`);
        }
        return;
    }

    if (error instanceof KeyringUnavailableError) {
        context.stdout.error(`${Icons.error} ${error.message}`);
        return;
    }

    if (error instanceof TaskAbortSignal) {
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

/**
 * Determines whether an error should be reported to Sentry.
 *
 * Only unexpected/internal errors are reported. User-facing errors
 * (validation, auth, CLI usage) are not bugs and should not be tracked.
 */
function shouldReportToSentry(error: unknown): boolean {
    if (error instanceof TaskAbortSignal) {
        return false;
    }
    if (error instanceof CliError) {
        return error.code === "INTERNAL_ERROR";
    }
    if (
        error instanceof ValidationError ||
        error instanceof SourcedValidationError ||
        error instanceof KeyringUnavailableError
    ) {
        return false;
    }
    return true;
}

function extractErrorCode(error: unknown): CliError.Code {
    if (error instanceof CliError && error.code != null) {
        return error.code;
    }
    if (error instanceof ValidationError || error instanceof SourcedValidationError) {
        return "VALIDATION_ERROR";
    }
    if (error instanceof KeyringUnavailableError) {
        return "UNAUTHORIZED_ERROR";
    }
    return "INTERNAL_ERROR";
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

/**
 * Exit gracefully by ending stdout and setting the exit code.
 *
 * When stdout is piped (not a TTY), Node buffers writes internally.
 * Calling process.exit() kills the process before the pipe consumer
 * (e.g. jq) reads all buffered data. Instead, we end stdout and set
 * process.exitCode so Node exits naturally once all streams drain.
 */
function exitGracefully(code: number): Promise<never> {
    process.exitCode = code;

    // If stdout is a TTY (unbuffered), exit immediately.
    if (process.stdout.isTTY) {
        process.exit(code);
    }

    // End stdout so Node can drain it and exit naturally.
    // We set process.exitCode above so the correct code is used.
    process.stdout.end();

    // Safety: force exit after 2s in case lingering handles prevent natural exit.
    const timeout = setTimeout(() => process.exit(code), 2000);
    timeout.unref();

    // Return a never-resolving promise — the process will exit via
    // natural drain or the safety timeout, not via this promise.
    return new Promise<never>(() => {
        /* no-op */
    });
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
