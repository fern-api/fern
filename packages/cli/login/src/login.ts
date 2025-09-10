import { FernUserToken, storeToken } from "@fern-api/auth";
import { getPosthogManager } from "@fern-api/posthog-manager";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

import { doAuth0DeviceAuthorizationFlow } from "./auth0-login/doAuth0DeviceAuthorizationFlow";
import { doAuth0LoginFlow } from "./auth0-login/doAuth0LoginFlow";
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, VENUS_AUDIENCE } from "./constants";

export async function login(
    context: TaskContext,
    { useDeviceCodeFlow = false }: { useDeviceCodeFlow?: boolean } = {}
): Promise<FernUserToken> {
    await context.instrumentPostHogEvent({
        command: "Login initiated"
    });

    const token = await getTokenFromAuth0(context, { useDeviceCodeFlow });
    await storeToken(token);

    context.logger.info(chalk.green("Logged in!"));

    (await getPosthogManager()).identify();

    return {
        type: "user",
        value: token
    };
}

async function getTokenFromAuth0(
    context: TaskContext,
    { useDeviceCodeFlow }: { useDeviceCodeFlow: boolean }
): Promise<string> {
    if (useDeviceCodeFlow) {
        return await doAuth0DeviceAuthorizationFlow({
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE,
            context
        });
    }

    try {
        return await doAuth0LoginFlow({
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE
        });
    } catch {
        return await doAuth0DeviceAuthorizationFlow({
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE,
            context
        });
    }
}
