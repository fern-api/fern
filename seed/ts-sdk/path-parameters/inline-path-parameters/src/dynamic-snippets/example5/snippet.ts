import { SeedPathParametersClient } from "../..";

async function main() {
    const client = new SeedPathParametersClient({
        environment: "https://api.fern.com",
    });
    await client.user.updateUser({
        tenantId: "tenant_id",
        userId: "user_id",
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
