import { SeedMixedFileDirectoryClient } from "../..";

async function main() {
    const client = new SeedMixedFileDirectoryClient({
        environment: "https://api.fern.com",
    });
    await client.user.list({
        limit: 1,
    });
}
main();
