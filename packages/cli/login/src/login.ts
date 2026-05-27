import { FernUserToken, isLoggedIn, storeToken } from "@fern-api/auth";
import { getPosthogManager } from "@fern-api/posthog-manager";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import inquirer from "inquirer";
import { doAuth0DeviceAuthorizationFlow } from "./auth0-login/doAuth0DeviceAuthorizationFlow.js";
import { type Auth0TokenResponse, doAuth0LoginFlow } from "./auth0-login/doAuth0LoginFlow.js";
import { resolveSsoConnection } from "./auth0-login/resolveSsoConnection.js";
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN, getDashboardBaseUrl, LOGIN_OPTIONS, VENUS_AUDIENCE } from "./constants.js";

export type { Auth0TokenResponse } from "./auth0-login/doAuth0LoginFlow.js";

export async function login(
    context: TaskContext,
    { useDeviceCodeFlow = false, email }: { useDeviceCodeFlow?: boolean; email?: string } = {}
): Promise<FernUserToken> {
    context.instrumentPostHogEvent({
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
            dashboardBaseUrl: getDashboardBaseUrl(),
            email
        });
        return await doAuth0LoginFlow({
            context,
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE,
            connection
        });
    }

    // In TTY mode, check for a locally stored token to decide the flow:
    // - If already logged in → open the browser directly (Auth0 session handles it)
    // - If not logged in → show an interactive prompt so the user stays in the CLI
    if (!forceReauth && process.stdout.isTTY && !(await isLoggedIn())) {
        return await promptAndLogin(context);
    }

    return await loginWithDeviceCodeFallback(context, { forceReauth });
}

async function loginWithDeviceCodeFallback(
    context: TaskContext,
    { forceReauth = false, connection }: { forceReauth?: boolean; connection?: string } = {}
): Promise<Auth0TokenResponse> {
    try {
        return await doAuth0LoginFlow({
            context,
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE,
            forceReauth,
            connection
        });
    } catch {
        return await doAuth0DeviceAuthorizationFlow({
            auth0Domain: AUTH0_DOMAIN,
            auth0ClientId: AUTH0_CLIENT_ID,
            audience: VENUS_AUDIENCE,
            context,
            connection
        });
    }
}

async function promptAndLogin(context: TaskContext): Promise<Auth0TokenResponse> {
    const choices = LOGIN_OPTIONS.map((opt) => ({ name: opt.label, value: opt.connection }));

    const selectedConnection = await promptForConnection(context, choices);

    // SSO requires resolving the enterprise connection from the user's email
    if (selectedConnection === "enterprise-sso") {
        const ssoEmail = await promptForEmail(context);

        const resolvedConnection = await resolveSsoConnection({
            dashboardBaseUrl: getDashboardBaseUrl(),
            email: ssoEmail
        });

        return await loginWithDeviceCodeFallback(context, { connection: resolvedConnection });
    }

    return await loginWithDeviceCodeFallback(context, { connection: selectedConnection });
}

async function promptForConnection(
    context: TaskContext,
    choices: Array<{ name: string; value: string }>
): Promise<string> {
    let result = "";
    await context.takeOverTerminal(async () => {
        const { connection } = await inquirer.prompt<{ connection: string }>([
            {
                type: "list",
                name: "connection",
                message: "How would you like to log in?",
                choices
            }
        ]);
        result = connection;
    });
    return result;
}

async function promptForEmail(context: TaskContext): Promise<string> {
    let result = "";
    await context.takeOverTerminal(async () => {
        const { email } = await inquirer.prompt<{ email: string }>([
            {
                type: "input",
                name: "email",
                message: "Enter your email address:",
                validate: (input: string) => {
                    const trimmed = input.trim();
                    if (trimmed.length === 0 || !trimmed.includes("@")) {
                        return "Please enter a valid email address.";
                    }
                    return true;
                }
            }
        ]);
        result = email.trim();
    });
    return result;
}
