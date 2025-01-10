import { SeedNoEnvironmentClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedNoEnvironmentClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.dummy.getDummy();
}
main();
