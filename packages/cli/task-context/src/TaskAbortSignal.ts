import { type CliError } from "./CliError.js";

/**
 * Thrown by `failAndThrow` to unwind the call stack after an error has
 * already been logged and (if applicable) reported to Sentry.
 *
 * This is NOT a real error — it carries no message or stack trace.
 * Catch sites should silently swallow it or re-throw without logging.
 *
 * The optional `code` field carries the originating {@link CliError.Code}
 * so the top-level exit-code mapper can produce a semantically correct
 * exit code even when the error itself has already been consumed.
 */
export class TaskAbortSignal {
    readonly __brand = "TaskAbortSignal" as const;
    readonly code: CliError.Code | undefined;

    constructor(code?: CliError.Code) {
        this.code = code;
    }
}
