import { isLoggedIn, removeToken } from "@fern-api/auth";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import open from "open";
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "./constants";

export async function logout(context: TaskContext): Promise<void> {
    await context.instrumentPostHogEvent({
        command: "Logout initiated"
    });

    const wasLoggedIn = await isLoggedIn();

    if (!wasLoggedIn) {
        context.logger.info(chalk.yellow("You are not currently logged in."));
        return;
    }

    // Remove the local token first
    await removeToken();

    // Open the Auth0 logout URL to clear the Auth0 session
    const logoutUrl = constructAuth0LogoutUrl();

    context.logger.info(chalk.blue("Opening browser to complete logout..."));

    try {
        await open(logoutUrl);
        context.logger.info(chalk.green("Successfully logged out! You can close the browser window."));
    } catch (error) {
        context.logger.warn(
            chalk.yellow(
                "Could not open browser automatically. Please visit this URL to complete logout:\n" + logoutUrl
            )
        );
    }

    await context.instrumentPostHogEvent({
        command: "Logout successful"
    });
}

function constructAuth0LogoutUrl(): string {
    // We don't specify a returnTo URL since we don't have a web app to return to
    // The user will see Auth0's default logout confirmation page
    const queryParams = new URLSearchParams({
        client_id: AUTH0_CLIENT_ID
    });

    return `https://${AUTH0_DOMAIN}/v2/logout?${queryParams.toString()}`;
}
