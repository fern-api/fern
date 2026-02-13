import { getAccessToken, getUserToken } from "@fern-api/auth";

import { PosthogManagerImpl } from "./PosthogManagerImpl.js";
import { NoopPosthogManager } from "./NoopPosthogManager.js";
import { PosthogManager } from "./PosthogManager.js";

let posthogManager: PosthogManager | undefined;

export async function getPosthogManager(): Promise<PosthogManager> {
    if (posthogManager == null) {
        posthogManager = await createPosthogManager();
    }
    return posthogManager;
}

async function createPosthogManager(): Promise<PosthogManager> {
    try {
        const posthogApiKey = process.env.POSTHOG_API_KEY;
        const disableTelemetry = process.env.FERN_DISABLE_TELEMETRY === "true";
        if (disableTelemetry) {
            return new NoopPosthogManager();
        } else if (!posthogApiKey) {
            // TODO: fetch an API key from Fern if one is not found.
            throw new Error('No Posthog API key found')
        }
        return new PosthogManagerImpl({ posthogApiKey });
    } catch (err) {
        return new NoopPosthogManager();
    }
}
