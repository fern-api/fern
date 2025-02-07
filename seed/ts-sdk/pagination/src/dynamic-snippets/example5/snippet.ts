import { SeedPaginationClient } from "../..";

async function main() {
    const client = new SeedPaginationClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.users.listWithCursorPagination({
        page: 1.1,
        perPage: 1.1,
        order: "asc",
        startingAfter: "starting_after",
    });
}
main();
