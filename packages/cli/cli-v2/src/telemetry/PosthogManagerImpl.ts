import { PosthogEvent } from "./PosthogEvent.js";
import { PostHog } from "posthog-node";

import { PosthogManager } from "./PosthogManager.js";

export class PosthogManagerImpl implements PosthogManager {
    private posthog: PostHog;

    constructor({ posthogApiKey }: { posthogApiKey: string }) {
        this.posthog = new PostHog(posthogApiKey);
    }

    public async identify(): Promise<void> {
        // no-op
    }

    public async sendEvent(event: PosthogEvent): Promise<void> {
        this.posthog.capture(event);
    }

    public async flush(): Promise<void> {
        await this.posthog.flush();
    }
}
