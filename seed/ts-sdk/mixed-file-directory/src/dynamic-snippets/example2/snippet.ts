import { SeedMixedFileDirectoryClient } from "../..";

async function main() {
    const client = new SeedMixedFileDirectoryClient({
        environment: "https://api.fern.com",
    });
    await client.user.events.listEvents({
        limit: 1,
    });
}
main();
