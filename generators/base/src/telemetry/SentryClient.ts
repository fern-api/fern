import * as Sentry from "@sentry/node";
import { resolveErrorCode } from "../GeneratorError.js";

export namespace SentryClient {
    export interface Options {
        workspaceName: string;
        organization: string;
        shouldTrackLocalVariables?: boolean;
    }
}

export class SentryClient {
    private readonly sentry: Sentry.NodeClient | undefined;

    constructor({ workspaceName, organization, shouldTrackLocalVariables = false }: SentryClient.Options) {
        const isTelemetryEnabled = process.env.FERN_DISABLE_TELEMETRY !== "true";
        const sentryDsn = process.env.SENTRY_DSN;
        if (isTelemetryEnabled && sentryDsn != null && sentryDsn.length > 0) {
            let sentryEnvironment = process.env.SENTRY_ENVIRONMENT;
            let sentryRelease = process.env.SENTRY_RELEASE;
            // Missing environment/release shouldn't hard-fail the generator —
            // warn and skip Sentry init so generation still proceeds.
            if (sentryEnvironment == null || sentryEnvironment.length === 0) {
                process.stderr.write("[warn] SENTRY_ENVIRONMENT is not set; using 'unknown'.\n");
                sentryEnvironment = "unknown";
            }
            if (sentryRelease == null || sentryRelease.length === 0) {
                process.stderr.write("[warn] SENTRY_RELEASE is not set; using 'unknown'.\n");
                sentryRelease = "unknown";
            }

            this.sentry = Sentry.init({
                dsn: sentryDsn,
                release: sentryRelease,
                environment: sentryEnvironment,
                // Opt out of every built-in integration (HTTP tracing, local
                // variables, console breadcrumbs, etc.) — a container process
                // only needs error capture.
                defaultIntegrations: false,
                // Rewrite absolute frame paths to repo-root-relative paths so
                // they align with the source maps uploaded at publish time.
                // onUncaughtException / onUnhandledRejection catch errors that
                // escape the try/catch in run() (e.g. fire-and-forget async
                // callbacks). They cover everything after Sentry init; a small
                // window at module-load time remains unmonitored without a
                // separate instrument.js entrypoint.
                // linkedErrors chains .cause so wrapped errors stay traceable.
                // nodeContext adds Node.js version and OS to every event.
                // localVariables attaches local variable values to each stack
                // frame (via the V8 inspector). We only enable it for remote
                // executions because the process runs in an isolated container
                // where there's no risk of leaking user-machine secrets, and
                // we want every bit of context we can get to debug generator
                // failures without a repro. Local (user-machine) runs skip it
                // to avoid serializing values that may contain tokens, env
                // vars, or customer spec contents.
                integrations: [
                    Sentry.rewriteFramesIntegration(),
                    Sentry.onUncaughtExceptionIntegration(),
                    Sentry.onUnhandledRejectionIntegration(),
                    Sentry.linkedErrorsIntegration(),
                    Sentry.nodeContextIntegration(),
                    ...(shouldTrackLocalVariables
                        ? [Sentry.localVariablesIntegration({ captureAllExceptions: true })]
                        : [])
                ],
                // Generators don't emit transactions; disable performance
                // sampling entirely to avoid unnecessary overhead.
                tracesSampleRate: 0,
                // Always attach a stack trace, even when the thrown value is
                // not an Error instance (e.g. a plain string or object).
                attachStacktrace: true,
                // Breadcrumbs are noise in a single-operation container
                // process — there is no meaningful event trail to capture.
                maxBreadcrumbs: 0,
                // Suppress the client-report envelope Sentry sends when events
                // are dropped (e.g. due to rate limits).
                sendClientReports: false
            });
            setSentryRunIdTags();

            Sentry.setTag("workspace_name", workspaceName);
            Sentry.setTag("organization", organization);
        }
    }

    public async captureException(error: unknown, { errorCode }: { errorCode?: string } = {}): Promise<void> {
        if (this.sentry == null) {
            return;
        }
        try {
            Sentry.setTag("error_code", errorCode ?? resolveErrorCode(error));
            this.sentry.captureException(error);
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

function setSentryRunIdTags(): void {
    const fernRunId = process.env.FERN_RUN_ID;
    if (fernRunId != null && fernRunId.length > 0) {
        Sentry.setTag("fern_run_id", fernRunId);
    }
    if (process.env.GITHUB_RUN_ID != null && process.env.GITHUB_RUN_ID.length > 0) {
        Sentry.setTag("github_run_id", process.env.GITHUB_RUN_ID);
    }
}
