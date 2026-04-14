import type { PosthogEvent } from "@fern-api/task-context";
import { CliError, resolveErrorCode, shouldReportToSentry, TaskAbortSignal } from "@fern-api/task-context";

export interface ErrorReporter {
    instrumentPostHogEvent: (event: PosthogEvent) => void;
    captureException: (error: unknown, code?: CliError.Code) => void;
}

export function reportError(
    reporter: ErrorReporter,
    error: unknown,
    options?: { message?: string; code?: CliError.Code }
): void {
    if (error instanceof TaskAbortSignal) {
        return;
    }
    const code = resolveErrorCode(error, options?.code);
    reporter.instrumentPostHogEvent({
        command: process.argv.join(" "),
        properties: {
            failed: true,
            errorCode: code
        }
    });
    if (shouldReportToSentry(code)) {
        reporter.captureException(error ?? new CliError({ message: options?.message ?? "", code }), code);
    }
}
