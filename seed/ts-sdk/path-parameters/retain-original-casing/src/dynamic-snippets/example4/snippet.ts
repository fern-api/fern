import { SeedPathParametersClient } from "../..";

async function main() {
    const client = new SeedPathParametersClient({
        environment: "https://api.fern.com",
    });
    await client.user.createUser("tenant_id", {
        name: "name",
        tags: [
            "tags",
            "tags",
        ],
    });
}
main();
