import { doAuth0LoginFlow } from "./auth0-login/doAuth0LoginFlow";
import { FernUserToken } from "./FernToken";
import { storeToken } from "./persistence/storeToken";

// these are client-side safe values
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN ?? "fern-prod.us.auth0.com";
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID ?? "syaWnk6SjNoo5xBf1omfvziU3q7085lh";
const VENUS_AUDIENCE = process.env.VENUS_AUDIENCE ?? "venus-prod";

export async function login(): Promise<FernUserToken> {
    const token = await doAuth0LoginFlow({
        auth0Domain: AUTH0_DOMAIN,
        auth0ClientId: AUTH0_CLIENT_ID,
        audience: VENUS_AUDIENCE,
    });
    await storeToken(token);
    return {
        type: "user",
        value: token,
    };
}
