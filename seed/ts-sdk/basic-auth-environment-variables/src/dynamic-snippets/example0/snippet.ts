import { SeedBasicAuthEnvironmentVariablesClient } from "../..";

async function main() {
    const client = new SeedBasicAuthEnvironmentVariablesClient({
        environment: "https://api.fern.com",
        username: "<username>",
        accessToken: "<password>",
    });
    await client.basicAuth.getWithBasicAuth();
}
main();
