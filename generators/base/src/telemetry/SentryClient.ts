import * as Sentry from "@sentry/node";

export class SentryClient {
    private readonly sentry: Sentry.NodeClient | undefined;

    constructor({ workspaceName, organization }: { workspaceName: string; organization: string }) {
        const isTelemetryEnabled = process.env.FERN_DISABLE_TELEMETRY !== "true";
        const sentryDsn = process.env.SENTRY_DSN;
        if (isTelemetryEnabled && sentryDsn != null && sentryDsn.length > 0) {
            const sentryEnvironment = process.env.SENTRY_ENVIRONMENT;
            const sentryRelease = process.env.SENTRY_RELEASE;
            if (sentryEnvironment == null || sentryEnvironment.length === 0) {
                throw new Error("SENTRY_ENVIRONMENT must be set when SENTRY_DSN is configured");
            }
            if (sentryRelease == null || sentryRelease.length === 0) {
                throw new Error("SENTRY_RELEASE must be set when SENTRY_DSN is configured");
            }

            this.sentry = Sentry.init({
                dsn: sentryDsn,
                release: sentryRelease,
                environment: sentryEnvironment,
                defaultIntegrations: false,
                integrations: [Sentry.rewriteFramesIntegration()],
                tracesSampleRate: 0
            });
            setSentryRunIdTags();

            Sentry.setTag("workspace_name", workspaceName);
            Sentry.setTag("organization", organization);
        }
    }

    public async captureException(error: unknown): Promise<void> {
        if (this.sentry == null) {
            return;
        }
        try {
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
