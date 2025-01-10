import { SeedBasicAuthEnvironmentVariablesClient } from "../..";

async function main() {
    const client = new SeedBasicAuthEnvironmentVariablesClient({
        environment: "https://api.fern.com",
        username: "<username>",
        password: "<password>",
    });
    await client.basicAuth.postWithBasicAuth({
        key: "value",
    });
}
main();
