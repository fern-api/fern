import { SeedApiClient } from "../..";

async function main() {
    const client = new SeedApiClient({
        environment: "https://api.fern.com",
    });
    await client.dataservice.list({
        prefix: "prefix",
        limit: 1,
        paginationToken: "paginationToken",
        namespace: "namespace",
    });
}
main();
