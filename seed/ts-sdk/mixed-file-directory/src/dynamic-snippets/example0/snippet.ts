import { SeedMixedFileDirectoryClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedMixedFileDirectoryClient({
        environment: "https://api.fern.com",
    });
    
    await client.organization.create({
        name: "name",
    });
}
main();
