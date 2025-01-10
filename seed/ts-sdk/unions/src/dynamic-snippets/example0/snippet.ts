import { SeedUnionsClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedUnionsClient({
        environment: "https://api.fern.com",
    });
    
    await client.union.get("id");
}
main();
