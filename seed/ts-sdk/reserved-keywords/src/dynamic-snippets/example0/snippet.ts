import { SeedNurseryApiClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedNurseryApiClient({
        environment: "https://api.fern.com",
    });
    
    await client.package.test({
        for: "for",
    });
}
main();
