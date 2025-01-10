import { SeedAuthEnvironmentVariablesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedAuthEnvironmentVariablesClient({
        environment: "https://api.fern.com",
        apiKey: "<value>",
    });
    
    await client.service.getWithApiKey();
}
main();
