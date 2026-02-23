import jwt, { JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import { FernUserToken } from "../FernToken.js";

const client = jwksClient({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

/**
 * Auth0 JWT payload with common claims from access tokens and ID tokens.
 */
export interface Auth0JwtPayload extends JwtPayload {
    /** Email address (from ID token or custom claim). */
    email?: string;
}

export async function verifyJwt(token: FernUserToken): Promise<boolean> {
    const decodedToken = jwt.decode(token.value, { complete: true });
    if (decodedToken == null) {
        return false;
    }

    try {
        const signingKey = await client.getSigningKey(decodedToken.header.kid);
        jwt.verify(token.value, signingKey.getPublicKey(), { algorithms: ["RS256"] });
        return true;
    } catch {
        return false;
    }
}

/**
 * Verifies a JWT using Auth0's JWKS endpoint and returns the decoded payload.
 */
export async function verifyAndDecodeJwt(token: string): Promise<Auth0JwtPayload | undefined> {
    const decodedToken = jwt.decode(token, { complete: true });
    if (decodedToken == null) {
        return undefined;
    }

    try {
        const signingKey = await client.getSigningKey(decodedToken.header.kid);

        const verified = jwt.verify(token, signingKey.getPublicKey(), { algorithms: ["RS256"] });
        if (typeof verified === "string") {
            return undefined;
        }

        return verified as Auth0JwtPayload;
    } catch {
        return undefined;
    }
}
