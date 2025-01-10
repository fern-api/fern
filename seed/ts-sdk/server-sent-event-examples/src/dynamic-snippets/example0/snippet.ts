import { SeedServerSentEventsClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedServerSentEventsClient({
        environment: "https://api.fern.com",
    });
    
    await client.completions.stream({
        query: "foo",
    });
}
main();
