import { SeedLiteralClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedLiteralClient({
        environment: "https://api.fern.com",
    });
    
    await client.headers.send({
        query: "What is the weather today",
    });
}
main();
