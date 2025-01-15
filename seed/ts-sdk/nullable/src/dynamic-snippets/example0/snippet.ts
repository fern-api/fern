import { SeedNullableClient } from "../..";

async function main() {
    const client = new SeedNullableClient({
        environment: "https://api.fern.com",
    });
    await client.nullable.getUsers({
        usernames: [
            "usernames",
        ],
        avatar: "avatar",
        activated: [
            true,
        ],
        tags: [],
    });
}
main();
