import { setSentryRunIdTags } from "@fern-api/cli-telemetry";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import * as Sentry from "@sentry/node";
import { mkdir, readFile, writeFile } from "fs/promises";
import IS_CI from "is-ci";
import * as os from "os";
import { homedir } from "os";
import { dirname } from "path";
import { PostHog } from "posthog-node";
import { validate as isValidUUID, v4 as uuidv4 } from "uuid";
import { FernRcSchemaLoader } from "../config/fern-rc/FernRcSchemaLoader.js";
import { Version } from "../version.js";
import type { LifecycleEvent } from "./LifecycleEvent.js";
import type { Tags } from "./Tags.js";

export class TelemetryClient {
    private readonly posthog: PostHog | undefined;
    private readonly sentry: Sentry.NodeClient | undefined;
    private readonly baseTags: Tags;
    private readonly accumulatedTags: Tags = {};
    private readonly distinctId: string;

    public static async create({ isTTY }: { isTTY: boolean }): Promise<TelemetryClient> {
        const distinctId = await TelemetryClient.getDistinctId();
        return new TelemetryClient({ isTTY, distinctId });
    }

    private constructor({ isTTY, distinctId }: { isTTY: boolean; distinctId: string }) {
        this.distinctId = distinctId;
        const isTelemetryEnabled = this.isTelemetryEnabled();
        const apiKey = process.env.POSTHOG_API_KEY;
        this.baseTags = {
            version: Version,
            arch: os.arch(),
            ci: IS_CI,
            os: os.platform(),
            tty: isTTY,
            usingAccessToken: process.env.FERN_TOKEN != null
        };
        this.posthog = apiKey != null && apiKey.length > 0 && isTelemetryEnabled ? new PostHog(apiKey) : undefined;

        const sentryDsn = process.env.SENTRY_DSN;
        if (sentryDsn != null && sentryDsn.length > 0 && isTelemetryEnabled) {
            const sentryEnvironment = process.env.SENTRY_ENVIRONMENT;
            if (sentryEnvironment == null || sentryEnvironment.length === 0) {
                throw new Error("SENTRY_ENVIRONMENT must be set when SENTRY_DSN is configured");
            }
            this.sentry = Sentry.init({
                dsn: sentryDsn,
                release: `cli@${Version}`,
                environment: sentryEnvironment,
                defaultIntegrations: false,
                integrations: [Sentry.rewriteFramesIntegration()],
                tracesSampleRate: 0
            });
            setSentryRunIdTags();
        }
    }

    /** Send a named event that inherits base + accumulated properties. */
    public sendEvent(event: string, tags?: Tags): void {
        if (this.posthog == null) {
            return;
        }
        try {
            this.posthog.capture({
                distinctId: this.distinctId,
                event,
                properties: { ...this.baseTags, ...this.accumulatedTags, ...tags }
            });
        } catch {
            // no-op
        }
    }

    /** Send the primary lifecycle event. This is automatically called after the command handler resolves.
     *
     * This is not meant to be called directly by command handlers.
     */
    public sendLifecycleEvent(event: LifecycleEvent): void {
        if (this.posthog == null) {
            return;
        }
        try {
            this.posthog.capture({
                distinctId: this.distinctId,
                event: "cli",
                properties: {
                    ...this.baseTags,
                    ...this.accumulatedTags,
                    ...event
                }
            });
        } catch {
            // no-op
        }
    }

    /** Tag the current event with additional context. Called by command handlers. */
    public tag(tags: Tags): void {
        Object.assign(this.accumulatedTags, tags);
    }

    /**
     * Report an exception to Sentry.
     *
     * The caller is responsible for deciding which errors are worth reporting
     * (see `shouldReportToSentry` in withContext.ts).
     */
    public captureException(error: unknown): void {
        if (this.sentry === undefined) {
            return;
        }
        try {
            this.sentry.captureException(error, {
                captureContext: {
                    user: { id: this.distinctId },
                    tags: { ...this.baseTags, ...this.accumulatedTags }
                }
            });
        } catch {
            // no-op
        }
    }

    public async flush(): Promise<void> {
        const promises: Promise<unknown>[] = [];
        if (this.posthog != null) {
            promises.push(this.posthog.shutdown().catch(() => undefined));
        }
        if (this.sentry !== undefined) {
            promises.push(Promise.resolve(this.sentry.flush(2000)).catch(() => undefined));
        }
        await Promise.all(promises);
    }

    private static async getDistinctId(): Promise<string> {
        const distinctIdFilepath = TelemetryClient.getDistinctIdFilepath();
        let distinctId: string | null = null;

        try {
            if (!(await doesPathExist(distinctIdFilepath))) {
                await mkdir(dirname(distinctIdFilepath), { recursive: true });
                await writeFile(distinctIdFilepath, uuidv4(), { flag: "wx" });
            }

            const content = (await readFile(distinctIdFilepath)).toString().trim();
            distinctId = content;
            if (!isValidUUID(content)) {
                // Update the cached ID if it was corrupted.
                const newId = uuidv4();
                await writeFile(distinctIdFilepath, newId);
                distinctId = newId;
            }
        } catch {
            distinctId = uuidv4(); // Fallback to a new ID.
        }

        if (distinctId == null || distinctId.length === 0) {
            distinctId = uuidv4();
        }

        return distinctId;
    }

    /**
     * The file that stores the distinct ID for the user (stored in ~/.fern/id).
     *
     * Note that all telemetry is anonymous, but we still use a shared distinct ID
     * to correlate metrics from the same user/machine across multiple CLI invocations.
     */
    private static getDistinctIdFilepath(): AbsoluteFilePath {
        return join(AbsoluteFilePath.of(homedir()), RelativeFilePath.of(".fern"), RelativeFilePath.of("id"));
    }

    /**
     * Returns true if telemetry should be disabled.
     *
     * Priority:
     *  1. FERN_TELEMETRY_DISABLED env var (any non-empty value)
     *  2. telemetry.enabled: false in ~/.fernrc
     */
    private isTelemetryEnabled(): boolean {
        const envDisabled = process.env["FERN_TELEMETRY_DISABLED"];
        if (envDisabled != null && envDisabled.length > 0) {
            return false;
        }
        const enabled = new FernRcSchemaLoader().loadTelemetryEnabledSync();
        return enabled ?? true;
    }
}
