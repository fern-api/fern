import { getAccessToken, getUserToken } from "@fern-api/auth";

import { AccessTokenPosthogManager } from "./AccessTokenPosthogManager";
import { NoopPosthogManager } from "./NoopPosthogManager";
import { PosthogManager } from "./PosthogManager";
import { UserPosthogManager } from "./UserPosthogManager";

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
        if (posthogApiKey == null || disableTelemetry) {
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
