import { SeedApiClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    
    await client.foo();
}
main();
