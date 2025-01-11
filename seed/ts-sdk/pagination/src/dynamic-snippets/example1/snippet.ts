import { SeedPaginationClient } from "../..";

async function main() {
    const client = new SeedPaginationClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.users.listWithBodyCursorPagination({
        pagination: {
            cursor: "cursor",
        },
    });
}
main();
