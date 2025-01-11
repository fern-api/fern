import { SeedMixedCaseClient } from "../..";

async function main() {
    const client = new SeedMixedCaseClient({
        environment: "https://api.fern.com",
    });
    await client.service.listResources({
        pageLimit: 1,
        beforeDate: "2023-01-15",
    });
}
main();
