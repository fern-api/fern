import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
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
    private readonly baseTags: Tags;
    private readonly accumulatedTags: Tags = {};
    private cachedDistinctId: string | undefined;

    constructor({ isTTY }: { isTTY: boolean }) {
        const apiKey = process.env.POSTHOG_API_KEY;
        this.baseTags = {
            version: Version,
            arch: os.arch(),
            ci: IS_CI,
            os: os.platform(),
            tty: isTTY,
            usingAccessToken: process.env.FERN_TOKEN != null
        };
        this.posthog =
            apiKey != null && apiKey.length > 0 && this.isTelemetryEnabled() ? new PostHog(apiKey) : undefined;
    }

    /** Send a named event that inherits base + accumulated properties. */
    public async sendEvent(event: string, tags?: Tags): Promise<void> {
        if (this.posthog == null) {
            return;
        }
        try {
            this.posthog.capture({
                distinctId: await this.getDistinctId(),
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
    public async sendLifecycleEvent(event: LifecycleEvent): Promise<void> {
        if (this.posthog == null) {
            return;
        }
        try {
            this.posthog.capture({
                distinctId: await this.getDistinctId(),
                event: "CLI",
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

        const distinctIdFilepath = this.getDistinctIdFilepath();

        try {
            if (!(await doesPathExist(distinctIdFilepath))) {
                await mkdir(dirname(distinctIdFilepath), { recursive: true });
                await writeFile(distinctIdFilepath, uuidv4(), { flag: "wx" });
            }

            const content = (await readFile(distinctIdFilepath)).toString().trim();
            this.cachedDistinctId = content;

            if (!isValidUUID(content)) {
                // Update the cached ID if it was corrupted.
                const newId = uuidv4();
                await writeFile(distinctIdFilepath, newId);
                this.cachedDistinctId = newId;
            }
        } catch {
            this.cachedDistinctId = uuidv4(); // Fallback to a new ID.
        }

        if (this.cachedDistinctId == null || this.cachedDistinctId.length === 0) {
            this.cachedDistinctId = uuidv4();
        }

        return this.cachedDistinctId;
    }

    /**
     * The file that stores the distinct ID for the user (stored in ~/.fern/id).
     *
     * Note that all telemetry is anonymous, but we still use a shared distinct ID
     * to correlate metrics from the same user/machine across multiple CLI invocations.
     */
    private getDistinctIdFilepath(): AbsoluteFilePath {
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
