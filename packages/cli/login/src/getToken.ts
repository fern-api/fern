import axios from "axios";
import { IncomingMessage, Server } from "http";
import open from "open";
import { createServer } from "./createServer";

export async function getToken({
    auth0Domain,
    auth0ClientId,
}: {
    auth0Domain: string;
    auth0ClientId: string;
}): Promise<string> {
    const { origin, server } = await createServer();
    const { code } = await getCode({ server, auth0Domain, auth0ClientId, origin });
    server.close();
    const token = await getTokenFromCode({ auth0Domain, auth0ClientId, code, origin });
    return token;
}

function getCode({
    server,
    auth0Domain,
    auth0ClientId,
    origin,
}: {
    server: Server;
    auth0Domain: string;
    auth0ClientId: string;
    origin: string;
}) {
    return new Promise<{ code: string }>((resolve) => {
        server.addListener("request", async (request, response) => {
            const code = parseCodeFromUrl(request, origin);
            if (code == null) {
                request.socket.end();
            } else {
                response.end("Success!");
                resolve({ code });
            }
        });

        void open(constructAuth0Url({ auth0ClientId, auth0Domain, origin }));
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
    origin,
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
            redirect_uri: origin,
        }).toString(),
        {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
}: {
    origin: string;
    auth0Domain: string;
    auth0ClientId: string;
}) {
    const queryParams = new URLSearchParams({
        client_id: auth0ClientId,
        response_type: "code",
        redirect_uri: origin,
    });
    return `https://${auth0Domain}/authorize?${queryParams.toString()}`;
}
