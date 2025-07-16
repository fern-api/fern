import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import { FernUserToken } from "../FernToken";

const client = jwksClient({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
});

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
