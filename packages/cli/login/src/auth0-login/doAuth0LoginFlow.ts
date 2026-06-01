import { CliError, type TaskContext } from "@fern-api/task-context";
import axios from "axios";
import { IncomingMessage, Server } from "http";
import open from "open";
import { LOGIN_SUCCESS_PAGE } from "../pages/login-success-page.js";
import { createServer } from "./createServer.js";

/**
 * Returns the base URL for Auth0, using HTTP for localhost (local dev) and HTTPS otherwise.
 */
function getAuth0BaseUrl(auth0Domain: string): string {
    const protocol = auth0Domain.startsWith("localhost") ? "http" : "https";
    return `${protocol}://${auth0Domain}`;
}

export interface Auth0TokenResponse {
    accessToken: string;
    idToken: string;
}

export async function doAuth0LoginFlow({
    context,
    auth0Domain,
    auth0ClientId,
    audience,
    forceReauth = false,
    connection,
    organization
}: {
    context: TaskContext;
    auth0Domain: string;
    auth0ClientId: string;
    audience: string;
    /** If true, forces re-authentication even if already logged in (allows switching accounts). */
    forceReauth?: boolean;
    /** If set, passes the connection parameter to Auth0 to route directly to a specific IdP. */
    connection?: string;
    /** If set, scopes the token to the specified Auth0 organization (by name). */
    organization?: string;
}): Promise<Auth0TokenResponse> {
    const { origin, server } = await createServer();
    const { code } = await getCode({
        context,
        server,
        auth0Domain,
        auth0ClientId,
        origin,
        audience,
        forceReauth,
        connection,
        organization
    });
    server.close();
    return await getTokenFromCode({ auth0Domain, auth0ClientId, code, origin });
}

function getCode({
    context,
    server,
    auth0Domain,
    auth0ClientId,
    origin,
    audience,
    forceReauth,
    connection,
    organization
}: {
    context: TaskContext;
    server: Server;
    auth0Domain: string;
    auth0ClientId: string;
    origin: string;
    audience: string;
    forceReauth: boolean;
    connection?: string;
    organization?: string;
}) {
    return new Promise<{ code: string }>((resolve) => {
        server.addListener("request", (request, response) => {
            const code = parseCodeFromUrl(request, origin);
            if (code == null) {
                request.socket.end();
            } else {
                response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                response.end(LOGIN_SUCCESS_PAGE, () => {
                    resolve({ code });
                });
            }
        });

        const loginUrl = constructAuth0Url({
            auth0ClientId,
            auth0Domain,
            origin,
            audience,
            forceReauth,
            connection,
            organization
        });
        void open(loginUrl).catch(() => {
            context.logger.info(
                [
                    "",
                    "Couldn't open a browser automatically.",
                    "If you're running fern on this machine, open this link to log in:",
                    loginUrl,
                    ""
                ].join("\n")
            );
        });
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
}): Promise<Auth0TokenResponse> {
    const response = await axios.post(
        `${getAuth0BaseUrl(auth0Domain)}/oauth/token`,
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
    const { access_token: accessToken, id_token: idToken } = response.data;
    if (accessToken == null) {
        throw new CliError({ message: "Access token is not defined", code: CliError.Code.AuthError });
    }
    if (idToken == null) {
        throw new CliError({ message: "ID token is not defined", code: CliError.Code.AuthError });
    }
    return { accessToken, idToken };
}

function constructAuth0Url({
    origin,
    auth0Domain,
    auth0ClientId,
    audience,
    forceReauth,
    connection,
    organization
}: {
    origin: string;
    auth0Domain: string;
    auth0ClientId: string;
    audience: string;
    forceReauth: boolean;
    connection?: string;
    organization?: string;
}) {
    const queryParams = new URLSearchParams({
        client_id: auth0ClientId,
        response_type: "code",
        scope: "openid profile email offline_access",
        redirect_uri: origin,
        audience
    });

    if (connection != null) {
        queryParams.set("connection", connection);
    }

    if (organization != null) {
        queryParams.set("organization", organization);
    }

    if (forceReauth) {
        queryParams.set("prompt", "login");
    }

    const url = `${getAuth0BaseUrl(auth0Domain)}/authorize?${queryParams.toString()}`;
    return url;
}
