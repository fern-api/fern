import { FernUserToken, getUserIdFromToken } from "@fern-api/auth";
import { PosthogEvent } from "@fern-api/task-context";
import { PostHog } from "posthog-node";
import { v4 as uuidv4 } from "uuid";
import { AbstractPosthogManager } from "./AbstractPosthogManager";

export class PosthogManager extends AbstractPosthogManager {
    private posthog: PostHog;
    private distinctId: string;

    constructor(token: FernUserToken | undefined, posthogApiKey: string) {
        super();
        this.posthog = new PostHog(posthogApiKey);
        const maybeUserId = token == null ? undefined : getUserIdFromToken(token);
        this.distinctId = maybeUserId ?? uuidv4();
    }

    async sendEvent(event: PosthogEvent): Promise<void> {
        await this.posthog.capture({
            distinctId: this.distinctId,
            event: "CLI",
            properties: {
                version: process.env.CLI_VERSION,
                ...event,
                ...event.properties,
            },
        });
    }
}
