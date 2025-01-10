import { SeedOauthClientCredentialsEnvironmentVariablesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedOauthClientCredentialsEnvironmentVariablesClient({
        environment: "https://api.fern.com",
    });
    
    await client.auth.getTokenWithClientCredentials({
        clientId: "client_id",
        clientSecret: "client_secret",
        scope: "scope",
    });
}
main();
