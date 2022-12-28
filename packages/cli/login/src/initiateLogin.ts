import { getToken } from "./getToken";
import { storeToken } from "./storeToken";

export declare namespace initiateLogin {
    export interface Args {
        auth0Domain?: string;
        auth0ClientId?: string;
        venusAudience?: string;
    }
}

export async function initiateLogin({
    auth0Domain = process.env.AUTH0_DOMAIN,
    auth0ClientId = process.env.AUTH0_CLIENT_ID,
    venusAudience = process.env.VENUS_AUDIENCE,
}: initiateLogin.Args = {}): Promise<void> {
    if (auth0Domain == null) {
        throw new Error("Cannot login because Auth0 domain is not defined.");
    }
    if (auth0ClientId == null) {
        throw new Error("Cannot login because Auth0 client ID is not defined.");
    }
    if (venusAudience == null) {
        throw new Error("Cannot login because Venus Audience is not defined.");
    }

    const token = await getToken({ auth0ClientId, auth0Domain, audience: venusAudience });
    await storeToken(token);
}
