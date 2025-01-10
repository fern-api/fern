import { SeedPaginationClient } from "../..";

async function main() {
    const client = new SeedPaginationClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.users.listWithOffsetStepPagination({
        page: 1,
        limit: 1,
        order: "asc",
    });
}
main();
