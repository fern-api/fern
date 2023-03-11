import { FernUserToken, storeToken } from "@fern-api/auth";
import { getPosthogManager } from "@fern-api/posthog-manager";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { doAuth0DeviceAuthorizationFlow } from "./auth0-login/doAuth0DeviceAuthorizationFlow";
import { doAuth0LoginFlow } from "./auth0-login/doAuth0LoginFlow";

// these are client-side safe values
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN ?? "fern-prod.us.auth0.com";
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID ?? "syaWnk6SjNoo5xBf1omfvziU3q7085lh";
const VENUS_AUDIENCE = process.env.VENUS_AUDIENCE ?? "venus-prod";

export async function login(context: TaskContext): Promise<FernUserToken> {
    context.instrumentPostHogEvent({
        command: "Login initiated",
    });

    let token: string;
    try {
        token = await doAuth0LoginFlow({
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE,
        });
    } catch {
        token = await doAuth0DeviceAuthorizationFlow({
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE,
            context,
        });
    }
    await storeToken(token);

    context.logger.info(chalk.green("Logged in!"));

    (await getPosthogManager()).identify();

    return {
        type: "user",
        value: token,
    };
}
