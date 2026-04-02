import axios from "axios";
import { IncomingMessage, Server } from "http";
import open from "open";

import { createServer } from "./createServer.js";

const SUCCESS_PAGE = `
<!DOCTYPE html>
<html id="web" lang="en">
  <head>
  <title>Fern</title>
  <link data-rh="true" rel="icon" href="https://www.buildwithfern.com/img/favicon.ico">
  </head>

  <body style="height: 100vh; width: 100vw; margin: 0; display: flex;">
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; margin-bottom: 20px;">
      <img src="https://i.pinimg.com/originals/e8/88/d4/e888d4feff8fd5ff63a965471a94b874.gif" height="250px" />
      <div style="font-family: sans-serif; font-size: 36px; font-weight: 600;">
        You're signed in!
      </div>
      <div style="font-family: sans-serif; font-size: 20px; color: gray; margin-top: 15px;">
        Head back to your terminal to continue using Fern.
      </div>
    </div>
  </body>

</html>
`;

export interface DashboardTokenResponse {
    accessToken: string;
}

export async function doDashboardLoginFlow({
    dashboardBaseUrl
}: {
    dashboardBaseUrl: string;
}): Promise<DashboardTokenResponse> {
    const { origin, server, port } = await createServer();
    const { code } = await getCodeFromDashboard({ server, dashboardBaseUrl, origin, port });
    server.close();
    return await exchangeCodeForToken({ dashboardBaseUrl, code });
}

function getCodeFromDashboard({
    server,
    dashboardBaseUrl,
    origin,
    port
}: {
    server: Server;
    dashboardBaseUrl: string;
    origin: string;
    port: number;
}) {
    return new Promise<{ code: string }>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        server.addListener("request", async (request, response) => {
            const code = parseCodeFromUrl(request, origin);
            if (code == null) {
                request.socket.end();
            } else {
                response.end(SUCCESS_PAGE);
                resolve({ code });
            }
        });

        void open(`${dashboardBaseUrl}/cli-login?port=${port}`);
    });
}

function parseCodeFromUrl(request: IncomingMessage, origin: string): string | undefined {
    if (request.url == null) {
        return undefined;
    }
    const { searchParams } = new URL(request.url, origin);
    return searchParams.get("code") ?? undefined;
}

async function exchangeCodeForToken({
    dashboardBaseUrl,
    code
}: {
    dashboardBaseUrl: string;
    code: string;
}): Promise<DashboardTokenResponse> {
    const response = await axios.post(
        `${dashboardBaseUrl}/api/cli-login/exchange`,
        { code },
        {
            headers: { "Content-Type": "application/json" }
        }
    );
    const { access_token: accessToken } = response.data;
    if (accessToken == null) {
        throw new Error("Access token is not defined in exchange response");
    }
    return { accessToken };
}
