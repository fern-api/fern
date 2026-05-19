import type { CaptureExceptionOptions, PosthogEvent } from "@fern-api/task-context";
import { CliError, resolveErrorCode, shouldReportToSentry, TaskAbortSignal } from "@fern-api/task-context";
import type { AutomationTelemetryEmitOptions } from "./AutomationTelemetryManager.js";
import { isAutomationMode } from "./automationTelemetryContext.js";
import { type AutomationTelemetryEvent, failureEventNameForCommand } from "./automationTelemetryEvent.js";

export interface ErrorReporter {
    instrumentPostHogEvent: (event: PosthogEvent) => void;
    captureException: (error: unknown, options?: CaptureExceptionOptions) => string | undefined;
    emitAutomationTelemetryEvent: (event: AutomationTelemetryEvent, options?: AutomationTelemetryEmitOptions) => void;
}

export function reportError(
    reporter: ErrorReporter,
    error: unknown,
    options?: { message?: string; code?: CliError.Code; argv?: readonly string[] }
): void {
    if (error instanceof TaskAbortSignal) {
        return;
    }
    const code = resolveErrorCode(error, options?.code);
    const argv = options?.argv ?? process.argv;
    const command = argv.join(" ");
    const errorMessage = options?.message ?? (error instanceof Error ? error.message : undefined) ?? "";
    const reportedError: unknown = error ?? new CliError({ message: errorMessage, code });

    // Automations have a different error reporting flow than the CLI.
    if (isAutomationMode()) {
        reportErrorForAutomationMode(argv, reporter, code, errorMessage, reportedError);
    } else {
        reportErrorForNormalMode(reporter, command, code, reportedError);
    }
}
function reportErrorForNormalMode(
    reporter: ErrorReporter,
    command: string,
    code: CliError.Code,
    reportedError: unknown
) {
    reporter.instrumentPostHogEvent({
        command,
        properties: {
            failed: true,
            errorCode: code
        }
    });

    if (shouldReportToSentry(code)) {
        reporter.captureException(reportedError, {
            tags: {
                "error.code": code
            }
        });
    }
}

function reportErrorForAutomationMode(
    argv: readonly string[],
    reporter: ErrorReporter,
    code: CliError.Code,
    errorMessage: string,
    reportedError: unknown
) {
    const failureEventName = failureEventNameForCommand(argv);
    reporter.emitAutomationTelemetryEvent(
        {
            event: failureEventName,
            errorCode: code,
            attributes: {
                error_message: errorMessage
            }
        },
        {
            error: reportedError
        }
    );
}
