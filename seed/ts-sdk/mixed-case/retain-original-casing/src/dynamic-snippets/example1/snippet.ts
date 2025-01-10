import { SeedMixedCaseClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedMixedCaseClient({
        environment: "https://api.fern.com",
    });
    
    await client.service.getResource("ResourceID");
}
main();
