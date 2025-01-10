import { SeedUndiscriminatedUnionsClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedUndiscriminatedUnionsClient({
        environment: "https://api.fern.com",
    });
    
    await client.union.get("string");
}
main();
