import { getAccessToken, getUserToken } from "@fern-api/auth";

import { AccessTokenPosthogManager } from "./AccessTokenPosthogManager.js";
import { NoopPosthogManager } from "./NoopPosthogManager.js";
import { PosthogManager } from "./PosthogManager.js";
import { UserPosthogManager } from "./UserPosthogManager.js";

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
        // Builds inject `""` when the publish job has no key; treat that like an unset key.
        if (posthogApiKey == null || posthogApiKey.trim().length === 0 || disableTelemetry) {
            return new NoopPosthogManager();
        }
        const userToken = await getUserToken();
        if (userToken != null) {
            return new UserPosthogManager({ token: userToken, posthogApiKey });
        }
        const accessToken = await getAccessToken();
        if (accessToken != null) {
            return new AccessTokenPosthogManager({ posthogApiKey });
        }
        return new UserPosthogManager({ token: undefined, posthogApiKey });
    } catch (err) {
        return new NoopPosthogManager();
    }
}
