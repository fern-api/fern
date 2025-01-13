import { SeedBearerTokenEnvironmentVariableClient } from "../..";

async function main() {
    const client = new SeedBearerTokenEnvironmentVariableClient({
        environment: "https://api.fern.com",
        apiKey: "<token>",
    });
    await client.service.getWithBearerToken();
}
main();
