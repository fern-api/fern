import { SeedResponsePropertyClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedResponsePropertyClient({
        environment: "https://api.fern.com",
    });
    
    await client.service.getMovie("string");
}
main();
