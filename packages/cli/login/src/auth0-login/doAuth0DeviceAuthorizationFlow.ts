import { delay } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import axios from "axios";
import boxen from "boxen";
import open from "open";
import qs from "qs";

import type { Auth0TokenResponse } from "./doAuth0LoginFlow.js";

/**
 * Returns the base URL for Auth0, using HTTP for localhost (local dev) and HTTPS otherwise.
 */
function getAuth0BaseUrl(auth0Domain: string): string {
    const protocol = auth0Domain.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${auth0Domain}`;
}

interface DeviceCodeResponse {
    device_code: string;
    user_code: string;
    verification_uri: string;
    verification_uri_complete: string;
    expires_in: number;
    interval: number;
}

export async function doAuth0DeviceAuthorizationFlow({
    auth0Domain,
    auth0ClientId,
    audience,
    context
}: {
    auth0Domain: string;
    auth0ClientId: string;
    audience: string;
    context: TaskContext;
}): Promise<Auth0TokenResponse> {
    const deviceCodeResponse = await axios.request<DeviceCodeResponse>({
        method: "POST",
        url: `${getAuth0BaseUrl(auth0Domain)}/oauth/device/code`,
        headers: { "content-type": "application/x-www-form-urlencoded" },
        data: qs.stringify({
            client_id: auth0ClientId,
            audience,
            scope: "openid profile email offline_access"
        }),
        validateStatus: () => true
    });

    if (deviceCodeResponse.status !== 200) {
        context.failAndThrow("Failed to authenticate", deviceCodeResponse.data);
    }

    await open(deviceCodeResponse.data.verification_uri_complete);

    context.logger.info(
        [
            "🌿 Welcome to Fern!",
            "",
            "Open this link to login: " + deviceCodeResponse.data.verification_uri_complete,
            boxen("Login code: " + deviceCodeResponse.data.user_code, {
                padding: 1,
                margin: 1,
                textAlignment: "center",
                borderColor: "green",
                borderStyle: "round"
            })
        ].join("\n")
    );

    return await pollForToken({
        auth0ClientId,
        auth0Domain,
        deviceCode: deviceCodeResponse.data.device_code,
        context
    });
}

interface PollTokenFailedResponse {
    error: "authorization_pending" | "slow_down" | "expired_token" | "access_denied";
    error_description: string;
}

interface PollTokenSuccessResponse {
    access_token: string;
    refresh_token: string;
    id_token: string;
    token_type: string;
    expires_in: number;
}

async function pollForToken({
    auth0Domain,
    auth0ClientId,
    deviceCode,
    context
}: {
    auth0Domain: string;
    auth0ClientId: string;
    deviceCode: string;
    context: TaskContext;
}): Promise<Auth0TokenResponse> {
    const response = await axios.request({
        method: "POST",
        url: `${getAuth0BaseUrl(auth0Domain)}/oauth/token`,
        headers: { "content-type": "application/x-www-form-urlencoded" },
        data: qs.stringify({
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            device_code: deviceCode,
            client_id: auth0ClientId
        }),
        validateStatus: () => true
    });

    if (response.status === 200) {
        const data = response.data as PollTokenSuccessResponse;
        return {
            accessToken: data.access_token,
            idToken: data.id_token
        };
    }

    const data = response.data as PollTokenFailedResponse;
    switch (data.error) {
        case "slow_down":
        case "authorization_pending":
            await delay(500);
            return pollForToken({
                auth0Domain,
                auth0ClientId,
                deviceCode,
                context
            });
        case "access_denied":
        case "expired_token":
        default:
            return context.failAndThrow("Failed to authenticate", data);
    }
}
