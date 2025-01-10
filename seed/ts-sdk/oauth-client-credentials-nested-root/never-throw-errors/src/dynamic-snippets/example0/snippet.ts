import { SeedOauthClientCredentialsClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedOauthClientCredentialsClient({
        environment: "https://api.fern.com",
    });
    
    await client.auth.getToken({
        clientId: "client_id",
        clientSecret: "client_secret",
        scope: "scope",
    });
}
main();
