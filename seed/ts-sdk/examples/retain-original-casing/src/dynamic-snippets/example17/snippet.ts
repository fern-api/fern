import { SeedExamplesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedExamplesClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.service.getMetadata({
        shallow: true,
        tag: [
            "tag",
        ],
        "X-API-Version": "X-API-Version",
    });
}
main();
