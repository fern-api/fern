import { SeedOauthClientCredentialsClient } from "../..";

async function main() {
    const client = new SeedOauthClientCredentialsClient({
        environment: "https://api.fern.com",
    });
    await client.auth.getTokenWithClientCredentials({
        cid: "cid",
        csr: "csr",
        scp: "scp",
        entityId: "entity_id",
        audience: "https://api.example.com",
        grantType: "client_credentials",
        scope: "scope",
    });
}
main();
