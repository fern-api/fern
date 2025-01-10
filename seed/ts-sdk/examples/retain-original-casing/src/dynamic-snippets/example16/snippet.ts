import { SeedExamplesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedExamplesClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.service.getMetadata({
        shallow: false,
        tag: [
            "development",
        ],
        X-API-Version: "0.0.1",
    });
}
main();
