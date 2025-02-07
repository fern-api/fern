import { SeedNullableClient } from "../..";

async function main() {
    const client = new SeedNullableClient({
        environment: "https://api.fern.com",
    });
    await client.nullable.createUser({
        username: "username",
        tags: [
            "tags",
            "tags",
        ],
        metadata: {
            createdAt: new Date("2024-01-15T09:30:00Z"),
            updatedAt: new Date("2024-01-15T09:30:00Z"),
            avatar: "avatar",
            activated: true,
        },
        avatar: "avatar",
    });
}
main();
