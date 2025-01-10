import { SeedPaginationClient } from "../..";

async function main() {
    const client = new SeedPaginationClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.users.listWithCursorPagination({
        startingAfter: "starting_after",
    });
}
main();
