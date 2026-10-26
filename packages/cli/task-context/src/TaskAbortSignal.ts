/**
 * Thrown by `failAndThrow` to unwind the call stack after an error has
 * already been logged and (if applicable) reported to PostHog.
 *
 * This is NOT a real error and carries no code or stack trace. It may retain
 * the already-logged failure message for structured-output callers. Catch
 * sites must not log that message again.
 */
export class TaskAbortSignal {
    readonly __brand = "TaskAbortSignal" as const;

    public constructor(public readonly failureMessage?: string) {}
}
