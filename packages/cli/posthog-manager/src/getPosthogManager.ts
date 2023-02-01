import { getAccessToken, getUserToken } from "@fern-api/auth";
import { AbstractPosthogManager } from "./AbstractPosthogManager";
import { NoopPosthogManager } from "./NoopPosthogManager";
import { PosthogManager } from "./PosthogManager";

export async function getPosthogManager(): Promise<AbstractPosthogManager> {
    const posthogApiKey = process.env.POSTHOG_API_KEY;
    if (posthogApiKey == null) {
        return new NoopPosthogManager();
    }
    const userToken = await getUserToken();
    if (userToken != null) {
        return new PosthogManager(userToken, posthogApiKey);
    }
    const accessToken = await getAccessToken();
    if (accessToken != null) {
        return new NoopPosthogManager();
    }
    return new PosthogManager(undefined, posthogApiKey);
}
