/**
 * Process-level safety net for packaged CLI runs.
 *
 * The normal failure path goes through `cliContext.failWithoutThrowing` ->
 * `reportError`, which fires the relevant telemetry flow. Anything that
 * escapes that flow - uncaught exceptions and unhandled promise rejections -
 * would otherwise exit without flushing Sentry/PostHog, and in automation
 * mode without reaching Slack or the automation dashboards.
 *
 * Signal-driven cancellation (SIGINT / SIGTERM) is handled separately by the
 * CLI entrypoint and, for automation commands, by command-specific cleanup.
 * We deliberately do not duplicate signal coverage here to avoid double-
 * emitting completion events.
 *
 * Handlers are not installed for local/dev runs so Node's default crash
 * behavior stays loud while developing. A one-shot re-entry guard prevents an
 * emit-during-shutdown loop if the report path itself throws.
 */
import { CliError } from "@fern-api/task-context";
import type { CliContext } from "../cli-context/CliContext.js";
import { shouldInitializeTelemetry } from "./shouldInitializeTelemetry.js";

export function installProcessHandlers(cliContext: CliContext, { isLocal }: { isLocal: boolean }): void {
    if (
        !shouldInitializeTelemetry({
            cliName: cliContext.environment.cliName,
            packageVersion: cliContext.environment.packageVersion,
            isLocal
        })
    ) {
        return;
    }

    let isHandlingFatal = false;

    const handleFatal = async (label: string, error: unknown): Promise<void> => {
        if (isHandlingFatal) {
            // Re-entry: a second fatal landed while we were trying to flush
            // the first. Bail out hard so we don't deadlock the runner.
            process.exit(1);
        }
        isHandlingFatal = true;
        try {
            cliContext.failWithoutThrowing(label, error, { code: CliError.Code.InternalError });
        } catch {
            // Reporting itself failed; nothing we can do, fall through to exit.
        }
        try {
            await cliContext.exit({ code: 1 });
        } catch {
            process.exit(1);
        }
    };

    process.on("uncaughtException", (error) => {
        void handleFatal("uncaught exception", error);
    });

    process.on("unhandledRejection", (reason) => {
        void handleFatal("unhandled promise rejection", reason);
    });
}
