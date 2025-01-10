import { SeedOauthClientCredentialsClient } from "../..";

async function main() {
    const client = new SeedOauthClientCredentialsClient({
        environment: "https://api.fern.com",
    });
    await client.auth.getTokenWithClientCredentials({
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: "https://api.example.com",
        grantType: "client_credentials",
        scope: "scope",
    });
}
main();
