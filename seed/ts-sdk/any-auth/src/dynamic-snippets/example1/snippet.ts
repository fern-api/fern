import { SeedAnyAuthClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedAnyAuthClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.user.get();
}
main();
