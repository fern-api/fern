import { SeedApiWideBasePathClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedApiWideBasePathClient({
        environment: "https://api.fern.com",
    });
    
    await client.service.post("pathParam", "serviceParam", "resourceParam", 1);
}
main();
