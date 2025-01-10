import { SeedBearerTokenEnvironmentVariableClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedBearerTokenEnvironmentVariableClient({
        environment: "https://api.fern.com",
        apiKey: "<token>",
    });
    
    await client.service.getWithBearerToken();
}
main();
