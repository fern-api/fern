import { PostHog } from "posthog-node";

import { PosthogEvent } from "@fern-api/task-context";

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
        await this.posthog.flush();
    }
}
