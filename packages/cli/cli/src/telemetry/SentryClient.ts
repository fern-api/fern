import { setSentryRunIdTags } from "@fern-api/cli-telemetry";
import { CliError } from "@fern-api/task-context";
import * as Sentry from "@sentry/node";

import { isTelemetryDisabled } from "./isTelemetryDisabled.js";

export class SentryClient {
    private readonly sentry: Sentry.NodeClient | undefined;

    constructor({ release }: { release: string }) {
        const sentryDsn = process.env.SENTRY_DSN;
        if (!isTelemetryDisabled() && sentryDsn != null && sentryDsn.length > 0) {
            const sentryEnvironment = process.env.SENTRY_ENVIRONMENT;
            if (sentryEnvironment == null || sentryEnvironment.length === 0) {
                throw new CliError({
                    message: "SENTRY_ENVIRONMENT must be set when SENTRY_DSN is configured",
                    code: CliError.Code.ConfigError
                });
            }
            this.sentry = Sentry.init({
                dsn: sentryDsn,
                release,
                environment: sentryEnvironment,
                // Opt out of every built-in integration (HTTP tracing, local
                // variables, console breadcrumbs, etc.) — error capture is all
                // we need.
                defaultIntegrations: false,
                // Rewrite absolute frame paths to repo-root-relative paths so
                // they align with the source maps uploaded at publish time.
                // onUncaughtException / onUnhandledRejection catch errors that
                // escape the CLI's top-level handler (fire-and-forget callbacks,
                // unhandled rejections in background work, etc.).
                // linkedErrors chains .cause so wrapped errors stay traceable.
                // nodeContext adds Node.js version and OS to every event.
                integrations: [
                    Sentry.rewriteFramesIntegration(),
                    Sentry.onUncaughtExceptionIntegration(),
                    Sentry.onUnhandledRejectionIntegration(),
                    Sentry.linkedErrorsIntegration(),
                    Sentry.nodeContextIntegration()
                ],
                // The CLI doesn't emit transactions; disable performance
                // sampling entirely.
                tracesSampleRate: 0,
                // Always attach a stack trace, even when the thrown value is
                // not an Error instance (e.g. a plain string or object).
                attachStacktrace: true,
                // Suppress the client-report envelope Sentry sends when events
                // are dropped (e.g. due to rate limits).
                sendClientReports: false
            });
            setSentryRunIdTags();
        }
    }

    public captureException(error: unknown, code?: string): void {
        if (this.sentry == null) {
            return;
        }
        try {
            this.sentry.captureException(
                error,
                code != null ? { captureContext: { tags: { "error.code": code } } } : undefined
            );
        } catch {
            // no-op
        }
    }

    public async flush(): Promise<void> {
        if (this.sentry == null) {
            return;
        }
        await Promise.resolve(this.sentry.flush(2000)).catch(() => undefined);
    }
}
