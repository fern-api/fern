import { SeedExhaustiveClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedExhaustiveClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.endpoints.primitive.getAndReturnDatetime(new Date("2024-01-15T09:30:00Z"));
}
main();
