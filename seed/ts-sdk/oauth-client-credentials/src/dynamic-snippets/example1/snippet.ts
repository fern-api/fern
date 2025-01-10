import { SeedOauthClientCredentialsClient } from "../..";

async function main() {
    const client = new SeedOauthClientCredentialsClient({
        environment: "https://api.fern.com",
    });
    await client.auth.refreshToken({
        clientId: "client_id",
        clientSecret: "client_secret",
        refreshToken: "refresh_token",
        audience: "https://api.example.com",
        grantType: "refresh_token",
        scope: "scope",
    });
}
main();
