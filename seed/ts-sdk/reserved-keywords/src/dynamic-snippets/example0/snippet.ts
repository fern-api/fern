import { SeedNurseryApiClient } from "../..";

async function main() {
    const client = new SeedNurseryApiClient({
        environment: "https://api.fern.com",
    });
    await client.package.test({
        for: "for",
    });
}
main();
