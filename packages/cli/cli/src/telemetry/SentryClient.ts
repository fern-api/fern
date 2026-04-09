import * as Sentry from "@sentry/node";
import { setSentryRunIdTags } from "./sentryRunId.js";

export class SentryClient {
    private readonly sentry: Sentry.NodeClient | undefined;

    constructor({ release }: { release: string }) {
        const isTelemetryEnabled = process.env.FERN_DISABLE_TELEMETRY !== "true";
        const sentryDsn = process.env.SENTRY_DSN;
        if (isTelemetryEnabled && sentryDsn != null && sentryDsn.length > 0) {
            const sentryEnvironment = process.env.SENTRY_ENVIRONMENT;
            if (sentryEnvironment == null || sentryEnvironment.length === 0) {
                throw new Error("SENTRY_ENVIRONMENT must be set when SENTRY_DSN is configured");
            }
            this.sentry = Sentry.init({
                dsn: sentryDsn,
                release,
                environment: sentryEnvironment,
                defaultIntegrations: false,
                integrations: [Sentry.rewriteFramesIntegration()],
                tracesSampleRate: 0
            });
            setSentryRunIdTags();
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
