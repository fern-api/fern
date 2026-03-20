import { FernGeneratorExec } from "@fern-api/base-generator";
import * as Sentry from "@sentry/node";

const TYPESCRIPT_GENERATOR_SENTRY_DSN =
    "https://9ad6d037cc75da1396348fadff87b1d4@o4509504076185600.ingest.us.sentry.io/4511021392527360";

const SENTRY_FLUSH_TIMEOUT_MS = 2000;

export class GeneratorSentryClient {
    private readonly sentryClient: Sentry.NodeClient | undefined;
    private readonly tags: Record<string, string>;

    public constructor({
        config,
        release
    }: {
        config: FernGeneratorExec.GeneratorConfig;
        release: string;
    }) {
        if (!shouldCaptureTelemetry(config.environment)) {
            this.sentryClient = undefined;
            this.tags = {};
            return;
        }

        const dsn = process.env["SENTRY_DSN_TYPESCRIPT"] ?? TYPESCRIPT_GENERATOR_SENTRY_DSN;
        if (dsn.length === 0) {
            this.sentryClient = undefined;
            this.tags = {};
            return;
        }

        const executionEnvironment = getExecutionEnvironment(config.environment);
        this.tags = {
            generator: "typescript-sdk",
            executionEnvironment,
            environmentType: config.environment.type
        };

        this.sentryClient = Sentry.init({
            dsn,
            release,
            environment: executionEnvironment,
            defaultIntegrations: false,
            tracesSampleRate: 0
        });
    }

    public async captureException(error: unknown): Promise<void> {
        if (this.sentryClient == null) {
            return;
        }

        try {
            this.sentryClient.captureException(error, {
                captureContext: {
                    tags: this.tags
                }
            });
        } catch {
            // no-op
        }
    }

    public async flush(): Promise<void> {
        if (this.sentryClient == null) {
            return;
        }
        try {
            await this.sentryClient.flush(SENTRY_FLUSH_TIMEOUT_MS);
        } catch {
            // no-op
        }
    }
}

function shouldCaptureTelemetry(environment: FernGeneratorExec.GeneratorEnvironment): boolean {
    if (environment.type === "remote") {
        return true;
    }
    return !isTelemetryDisabledForLocalExecution();
}

function isTelemetryDisabledForLocalExecution(): boolean {
    return isTruthy(process.env["FERN_DISABLE_TELEMETRY"]) || isTruthy(process.env["FERN_TELEMETRY_DISABLED"]);
}

function isTruthy(value: string | undefined): boolean {
    if (value == null) {
        return false;
    }
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function getExecutionEnvironment(environment: FernGeneratorExec.GeneratorEnvironment): "local" | "dev" | "prod" {
    if (environment.type === "local") {
        return "local";
    }
    return environment.coordinatorUrlV2.endsWith("dev2.buildwithfern.com") ? "dev" : "prod";
}
