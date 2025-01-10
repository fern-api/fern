import { SeedMixedFileDirectoryClient } from "../..";

async function main() {
    const client = new SeedMixedFileDirectoryClient({
        environment: "https://api.fern.com",
    });
    await client.organization.create({
        name: "name",
    });
}
main();
