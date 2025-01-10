import { SeedStreamingClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedStreamingClient({
        environment: "https://api.fern.com",
    });
    
    await client.dummy.generateStream({
        numEvents: 1,
    });
}
main();
