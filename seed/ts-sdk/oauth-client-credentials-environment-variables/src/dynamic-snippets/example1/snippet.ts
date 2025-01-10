import { SeedOauthClientCredentialsEnvironmentVariablesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedOauthClientCredentialsEnvironmentVariablesClient({
        environment: "https://api.fern.com",
    });
    
    await client.auth.refreshToken({
        clientId: "client_id",
        clientSecret: "client_secret",
        refreshToken: "refresh_token",
        scope: "scope",
    });
}
main();
