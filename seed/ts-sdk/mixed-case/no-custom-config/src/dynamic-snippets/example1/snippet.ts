import { SeedMixedCaseClient } from "../..";

async function main() {
    const client = new SeedMixedCaseClient({
        environment: "https://api.fern.com",
    });
    await client.service.getResource("ResourceID");
}
main();
