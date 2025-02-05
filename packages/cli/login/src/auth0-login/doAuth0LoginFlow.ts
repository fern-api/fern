import axios from "axios";
import { IncomingMessage, Server } from "http";
import open from "open";

import { createServer } from "./createServer";

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

      <div data-tf-widget="RuultGU6" data-tf-opacity="100" data-tf-iframe-props="title=How did you hear about us?" data-tf-transitive-search-params data-tf-medium="snippet" style="width:100%;height:500px;"></div>
      <script src="//embed.typeform.com/next/embed.js"></script>
    </div>
  </body>

</html>
`;

export async function doAuth0LoginFlow({
    auth0Domain,
    auth0ClientId,
    audience
}: {
    auth0Domain: string;
    auth0ClientId: string;
    audience: string;
}): Promise<string> {
    const { origin, server } = await createServer();
    const { code } = await getCode({ server, auth0Domain, auth0ClientId, origin, audience });
    server.close();
    const token = await getTokenFromCode({ auth0Domain, auth0ClientId, code, origin });
    return token;
}

function getCode({
    server,
    auth0Domain,
    auth0ClientId,
    origin,
    audience
}: {
    server: Server;
    auth0Domain: string;
    auth0ClientId: string;
    origin: string;
    audience: string;
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

        void open(constructAuth0Url({ auth0ClientId, auth0Domain, origin, audience }));
    });
}

function parseCodeFromUrl(request: IncomingMessage, origin: string): string | undefined {
    if (request.url == null) {
        return undefined;
    }
    const { searchParams } = new URL(request.url, origin);
    return searchParams.get("code") ?? undefined;
}

async function getTokenFromCode({
    auth0Domain,
    auth0ClientId,
    code,
    origin
}: {
    auth0Domain: string;
    auth0ClientId: string;
    code: string;
    origin: string;
}): Promise<string> {
    const response = await axios.post(
        `https://${auth0Domain}/oauth/token`,
        new URLSearchParams({
            grant_type: "authorization_code",
            client_id: auth0ClientId,
            code,
            redirect_uri: origin
        }).toString(),
        {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }
    );
    const { access_token: token } = response.data;
    if (token == null) {
        throw new Error("Token is not defined");
    }
    return token;
}

function constructAuth0Url({
    origin,
    auth0Domain,
    auth0ClientId,
    audience
}: {
    origin: string;
    auth0Domain: string;
    auth0ClientId: string;
    audience: string;
}) {
    const queryParams = new URLSearchParams({
        client_id: auth0ClientId,
        response_type: "code",
        connection: "github",
        scope: "openid profile email offline_access",
        redirect_uri: origin,
        audience
    });
    return `https://${auth0Domain}/authorize?${queryParams.toString()}`;
}
