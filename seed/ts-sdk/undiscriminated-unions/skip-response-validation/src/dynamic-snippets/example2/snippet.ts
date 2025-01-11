import { SeedUndiscriminatedUnionsClient } from "../..";

async function main() {
    const client = new SeedUndiscriminatedUnionsClient({
        environment: "https://api.fern.com",
    });
    await client.union.getMetadata();
}
main();
