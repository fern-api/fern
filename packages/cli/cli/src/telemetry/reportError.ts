import type { PosthogEvent } from "@fern-api/task-context";
import { CliError, resolveErrorCode, TaskAbortSignal } from "@fern-api/task-context";
import { isAutomationMode } from "./automationTelemetryContext.js";
import { type AutomationTelemetryEvent, failureEventNameForCommand } from "./automationTelemetryEvent.js";

export interface ErrorReporter {
    instrumentPostHogEvent: (event: PosthogEvent) => void;
    emitAutomationTelemetryEvent: (event: AutomationTelemetryEvent) => void;
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

    // Automations have a different error reporting flow than the CLI.
    if (isAutomationMode()) {
        reportErrorForAutomationMode(argv, reporter, code, errorMessage);
    } else {
        reportErrorForNormalMode(reporter, command, code);
    }
}
function reportErrorForNormalMode(reporter: ErrorReporter, command: string, code: CliError.Code) {
    reporter.instrumentPostHogEvent({
        command,
        properties: {
            failed: true,
            errorCode: code
        }
    });
}

function reportErrorForAutomationMode(
    argv: readonly string[],
    reporter: ErrorReporter,
    code: CliError.Code,
    errorMessage: string
) {
    const failureEventName = failureEventNameForCommand(argv);
    reporter.emitAutomationTelemetryEvent({
        event: failureEventName,
        errorCode: code,
        attributes: {
            error_message: errorMessage
        }
    });
}
