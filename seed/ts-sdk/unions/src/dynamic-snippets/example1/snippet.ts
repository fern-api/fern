import { SeedUnionsClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedUnionsClient({
        environment: "https://api.fern.com",
    });
    
    await client.union.update({
        type: "circle",
        radius: 1.1,
    });
}
main();
