import { FernUserToken, storeToken } from "@fern-api/auth";
import { getPosthogManager } from "@fern-api/posthog-manager";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

import { doAuth0DeviceAuthorizationFlow } from "./auth0-login/doAuth0DeviceAuthorizationFlow.js";
import { type Auth0TokenResponse, doAuth0LoginFlow } from "./auth0-login/doAuth0LoginFlow.js";
import { resolveSsoConnection } from "./auth0-login/resolveSsoConnection.js";
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, DASHBOARD_BASE_URL, VENUS_AUDIENCE } from "./constants.js";

export type { Auth0TokenResponse } from "./auth0-login/doAuth0LoginFlow.js";

export async function login(
    context: TaskContext,
    { useDeviceCodeFlow = false, email }: { useDeviceCodeFlow?: boolean; email?: string } = {}
): Promise<FernUserToken> {
    await context.instrumentPostHogEvent({
        command: "Login initiated"
    });

    const { accessToken } = await getTokenFromAuth0(context, { useDeviceCodeFlow, email });
    await storeToken(accessToken);

    context.logger.info(chalk.green("Logged in!"));

    (await getPosthogManager()).identify();

    return {
        type: "user",
        value: accessToken
    };
}

export async function getTokenFromAuth0(
    context: TaskContext,
    {
        useDeviceCodeFlow,
        forceReauth = false,
        email
    }: { useDeviceCodeFlow: boolean; forceReauth?: boolean; email?: string }
): Promise<Auth0TokenResponse> {
    if (useDeviceCodeFlow) {
        return await doAuth0DeviceAuthorizationFlow({
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE,
            context
        });
    }

    // If email is provided, resolve the SSO connection and go directly to the IdP
    if (email != null) {
        const connection = await resolveSsoConnection({
            dashboardBaseUrl: DASHBOARD_BASE_URL,
            email
        });
        return await doAuth0LoginFlow({
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE,
            connection
        });
    }

    try {
        return await doAuth0LoginFlow({
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE,
            forceReauth
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
