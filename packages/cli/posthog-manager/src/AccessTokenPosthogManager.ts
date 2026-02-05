import { PosthogEvent } from "@fern-api/task-context";
import { PostHog } from "posthog-node";

import { PosthogManager } from "./PosthogManager";

export class AccessTokenPosthogManager implements PosthogManager {
    private posthog: PostHog;

    constructor({ posthogApiKey }: { posthogApiKey: string }) {
        this.posthog = new PostHog(posthogApiKey);
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
                    usingAccessToken: true
                }
            });
        }
    }

    public async flush(): Promise<void> {
        try {
            await this.posthog.flush();
        } catch (error) {
            // Log at debug level for internal visibility, but don't show to users by default
            // These are typically network errors in air-gapped environments
            // biome-ignore lint/suspicious/noConsole: intentional debug logging for internal troubleshooting
            console.debug("[PostHog] Failed to flush analytics:", error);
        }
    }
}
