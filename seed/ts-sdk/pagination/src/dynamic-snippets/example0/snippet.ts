import { SeedPaginationClient } from "../..";

async function main() {
    const client = new SeedPaginationClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.complex.search({
        pagination: {
            perPage: 1,
            startingAfter: "starting_after",
        },
        query: {
            field: "field",
            operator: "=",
            value: "value",
        },
    });
}
main();
