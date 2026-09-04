import { getRunIdProperties } from "@fern-api/cli-telemetry";
import type { PosthogAutomationEvent, PosthogEvent } from "@fern-api/task-context";
import { PostHog } from "posthog-node";

import { createPosthogClient } from "./createPosthogClient.js";
import { PosthogManager } from "./PosthogManager.js";

export class AccessTokenPosthogManager implements PosthogManager {
    private posthog: PostHog;

    constructor({ posthogApiKey }: { posthogApiKey: string }) {
        this.posthog = createPosthogClient(posthogApiKey);
    }

    public async identify(): Promise<void> {
        // no-op
    }

    public async sendEvent(event: PosthogEvent): Promise<void> {
        if (event.orgId != null) {
            this.posthog.capture({
                distinctId: event.orgId,
                event: "CLI",
                properties: {
                    ...event,
                    ...event.properties,
                    version: process.env.CLI_VERSION,
                    usingAccessToken: true,
                    ...getRunIdProperties()
                }
            });
        }
    }

    public sendAutomationEvent(event: PosthogAutomationEvent): void {
        this.posthog.capture({
            distinctId: event.distinctId,
            event: event.event,
            properties: event.properties
        });
    }

    public async flush(): Promise<void> {
        try {
            const flushPromise = this.posthog.flush().catch(() => {
                // Swallow late failures so a timed-out flush doesn't surface as an
                // unhandled rejection.
            });
            await Promise.race([flushPromise, new Promise<void>((resolve) => setTimeout(resolve, 3000))]);
        } catch {
            // Silently swallow – analytics should never block the CLI
        }
    }
}
