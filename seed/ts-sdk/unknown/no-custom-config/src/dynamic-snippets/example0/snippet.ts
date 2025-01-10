import { SeedUnknownAsAnyClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedUnknownAsAnyClient({
        environment: "https://api.fern.com",
    });
    
    await client.unknown.post({
        key: "value",
    });
}
main();
