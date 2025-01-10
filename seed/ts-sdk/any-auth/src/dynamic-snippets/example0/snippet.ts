import { SeedAnyAuthClient } from "../..";

async function main() {
    const client = new SeedAnyAuthClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.auth.getToken({
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: "https://api.example.com",
        grantType: "client_credentials",
        scope: "scope",
    });
}
main();
