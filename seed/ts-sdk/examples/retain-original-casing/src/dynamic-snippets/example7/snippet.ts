import { SeedExamplesClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedExamplesClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.health.service.check("id-2sdx82h");
}
main();
