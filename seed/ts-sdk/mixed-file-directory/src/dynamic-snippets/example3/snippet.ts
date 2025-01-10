import { SeedMixedFileDirectoryClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedMixedFileDirectoryClient({
        environment: "https://api.fern.com",
    });
    
    await client.user.events.metadata.getMetadata({
        id: "id",
    });
}
main();
