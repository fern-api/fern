import { SeedObjectsWithImportsClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedObjectsWithImportsClient({
        environment: "https://api.fern.com",
    });
    
    await client.optional.sendOptionalBody({
        string: {
            key: "value",
        },
    });
}
main();
