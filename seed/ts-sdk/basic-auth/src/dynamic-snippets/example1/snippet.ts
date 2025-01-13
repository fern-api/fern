import { SeedBasicAuthClient } from "../..";

async function main() {
    const client = new SeedBasicAuthClient({
        environment: "https://api.fern.com",
        username: "<username>",
        password: "<password>",
    });
    await client.basicAuth.postWithBasicAuth({
        key: "value",
    });
}
main();
