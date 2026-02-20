import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, readFile, writeFile } from "fs/promises";
import IS_CI from "is-ci";
import * as os from "os";
import { homedir } from "os";
import { dirname } from "path";
import { PostHog } from "posthog-node";
import { v4 as uuidv4 } from "uuid";
import { FernRcSchemaLoader } from "../config/fern-rc/FernRcSchemaLoader.js";
import { Version } from "../version.js";
import type { LifecycleEvent } from "./LifecycleEvent.js";

// The file that stores the distinct ID for the user (stored in ~/.fern/id).
//
// Note that all telemetry is anonymous, but we still use a shared distinct ID
// to correlate metrics from the same user/machine across multiple CLI invocations.
const DISTINCT_ID_FILE: AbsoluteFilePath = join(
    AbsoluteFilePath.of(homedir()),
    RelativeFilePath.of(".fern"),
    RelativeFilePath.of("id")
);

export class TelemetryClient {
    private readonly posthog: PostHog | undefined;
    private readonly baseProperties: Record<string, unknown>;
    private readonly accumulatedProperties: Record<string, unknown> = {};
    private cachedDistinctId: string | undefined;

    constructor({ isTTY }: { isTTY: boolean }) {
        const apiKey = process.env.POSTHOG_API_KEY;
        this.posthog =
            apiKey != null && apiKey.length > 0 && this.isTelemetryEnabled() ? new PostHog(apiKey) : undefined;
        this.baseProperties = {
            version: Version,
            arch: os.arch(),
            ci: IS_CI,
            os: os.platform(),
            tty: isTTY,
            usingAccessToken: process.env.FERN_TOKEN != null
        };
    }

    /** Emit a separate named event that inherits base + accumulated properties. */
    public async track(eventName: string, properties?: Record<string, unknown>): Promise<void> {
        if (this.posthog == null) {
            return;
        }
        try {
            this.posthog.capture({
                distinctId: await this.getDistinctId(),
                event: eventName,
                properties: { ...this.baseProperties, ...this.accumulatedProperties, ...properties }
            });
        } catch {
            // no-op
        }
    }

    /** Send the primary lifecycle event. Called after the command handler resolves. */
    public async sendLifecycleEvent(event: LifecycleEvent): Promise<void> {
        if (this.posthog == null) {
            return;
        }
        try {
            this.posthog.capture({
                distinctId: await this.getDistinctId(),
                event: "CLI",
                properties: {
                    ...this.baseProperties,
                    ...this.accumulatedProperties,
                    ...event
                }
            });
        } catch {
            // no-op
        }
    }

    /** Enrich the lifecycle event with additional context. Called by command handlers. */
    public addProperties(properties: Record<string, unknown>): void {
        Object.assign(this.accumulatedProperties, properties);
    }

    public async flush(): Promise<void> {
        if (this.posthog == null) {
            return;
        }
        try {
            await this.posthog.flush();
        } catch {
            // no-op
        }
    }

    private async getDistinctId(): Promise<string> {
        if (this.cachedDistinctId != null) {
            return this.cachedDistinctId;
        }
        try {
            if (!(await doesPathExist(DISTINCT_ID_FILE))) {
                await mkdir(dirname(DISTINCT_ID_FILE), { recursive: true });
                await writeFile(DISTINCT_ID_FILE, uuidv4());
            }
            this.cachedDistinctId = (await readFile(DISTINCT_ID_FILE)).toString().trim();
        } catch {
            this.cachedDistinctId = uuidv4(); // fallback
        }
        if (this.cachedDistinctId == null) {
            this.cachedDistinctId = uuidv4();
        }
        return this.cachedDistinctId;
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
