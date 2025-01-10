import { SeedOauthClientCredentialsDefaultClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedOauthClientCredentialsDefaultClient({
        environment: "https://api.fern.com",
    });
    
    await client.auth.getToken({
        clientId: "client_id",
        clientSecret: "client_secret",
    });
}
main();
