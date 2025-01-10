import { SeedPathParametersClient } from "../..";

async function main() {
    const client = new SeedPathParametersClient({
        environment: "https://api.fern.com",
    });
    await client.user.updateUser({
        tenant_id: "tenant_id",
        user_id: "user_id",
        body: {
            name: "name",
            tags: [
                "tags",
                "tags",
            ],
        },
    });
}
main();
