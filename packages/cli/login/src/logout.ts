import { isLoggedIn, removeToken } from "@fern-api/auth";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import open from "open";
import { createServer } from "./auth0-login/createServer.js";
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "./constants.js";
import { LOGOUT_SUCCESS_PAGE } from "./pages/logout-success-page.js";

const LOGOUT_TIMEOUT_MS = 15_000;

export async function logout(context: TaskContext): Promise<void> {
    context.instrumentPostHogEvent({
        command: "Logout initiated"
    });

    const wasLoggedIn = await isLoggedIn();

    if (!wasLoggedIn) {
        context.logger.info(chalk.yellow("You are not currently logged in."));
        return;
    }

    await removeToken();

    const { server, origin } = await createServer();

    const redirectReceived = new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
            server.close();
            resolve();
        }, LOGOUT_TIMEOUT_MS);

        server.addListener("request", (_request, response) => {
            clearTimeout(timeout);
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            response.end(LOGOUT_SUCCESS_PAGE, () => {
                server.close();
                resolve();
            });
        });
    });

    const logoutUrl = constructAuth0LogoutUrl(origin);

    context.logger.info(chalk.blue("Opening browser to complete logout..."));

    try {
        await open(logoutUrl);
    } catch {
        server.close();
        context.logger.warn(
            chalk.yellow(
                "Could not open browser automatically. Please visit this URL to complete logout:\n" + logoutUrl
            )
        );
        return;
    }

    await redirectReceived;

    context.logger.info(chalk.green("Successfully logged out!"));

    context.instrumentPostHogEvent({
        command: "Logout successful"
    });
}

function constructAuth0LogoutUrl(returnTo: string): string {
    const queryParams = new URLSearchParams({
        client_id: AUTH0_CLIENT_ID,
        returnTo
    });

    return `https://${AUTH0_DOMAIN}/v2/logout?${queryParams.toString()}`;
}
