import { SeedAuthEnvironmentVariablesClient } from "../..";

async function main() {
    const client = new SeedAuthEnvironmentVariablesClient({
        environment: "https://api.fern.com",
        apiKey: "<value>",
    });
    await client.service.getWithHeader({
        xEndpointHeader: "X-Endpoint-Header",
    });
}
main();
