import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

export async function verifyJwt(token: string): Promise<boolean> {
    const decodedToken = jwt.decode(token, { complete: true });
    if (decodedToken == null) {
        return false;
    }

    try {
        const signingKey = await client.getSigningKey(decodedToken.header.kid);
        jwt.verify(token, signingKey.getPublicKey(), { algorithms: ["RS256"] });
        return true;
    } catch {
        return false;
    }
}
