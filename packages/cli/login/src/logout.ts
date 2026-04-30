import { isLoggedIn, removeToken } from "@fern-api/auth";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import open from "open";
import { createServer } from "./auth0-login/createServer.js";
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "./constants.js";

const LOGOUT_SUCCESS_PAGE = `
<!DOCTYPE html>
<html id="web" lang="en">
  <head>
  <title>Fern</title>
  <link data-rh="true" rel="icon" href="https://www.buildwithfern.com/img/favicon.ico">
  </head>

  <body style="height: 100vh; width: 100vw; margin: 0; display: flex;">
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; margin-bottom: 20px;">
      <div style="font-family: sans-serif; font-size: 36px; font-weight: 600;">
        You're signed out!
      </div>
      <div style="font-family: sans-serif; font-size: 20px; color: gray; margin-top: 15px;">
        You can close this browser window.
      </div>
    </div>
  </body>

</html>
`;

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

    // Remove the local token first
    await removeToken();

    // Start a local server to handle the Auth0 logout redirect
    const { server, origin } = await createServer();

    const redirectReceived = new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
            server.close();
            resolve();
        }, LOGOUT_TIMEOUT_MS);

        server.addListener("request", (_request, response) => {
            clearTimeout(timeout);
            response.end(LOGOUT_SUCCESS_PAGE);
            server.close();
            resolve();
        });
    });

    const logoutUrl = constructAuth0LogoutUrl(origin);

    context.logger.info(chalk.blue("Opening browser to complete logout..."));

    try {
        await open(logoutUrl);
    } catch (error) {
        server.close();
        context.logger.warn(
            chalk.yellow(
                "Could not open browser automatically. Please visit this URL to complete logout:\n" + logoutUrl
            )
        );
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
