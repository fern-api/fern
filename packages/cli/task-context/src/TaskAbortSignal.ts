/**
 * Thrown by `failAndThrow` to unwind the call stack after an error has
 * already been logged and (if applicable) reported to Sentry.
 *
 * This is NOT a real error — it carries no message, code, or stack trace.
 * Catch sites should silently swallow it or re-throw without logging.
 */
export class TaskAbortSignal {
    readonly __brand = "TaskAbortSignal" as const;
}
