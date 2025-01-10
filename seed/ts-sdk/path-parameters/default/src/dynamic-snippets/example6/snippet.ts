import { SeedPathParametersClient } from "../..";

async function main() {
    const client = new SeedPathParametersClient({
        environment: "https://api.fern.com",
    });
    await client.user.searchUsers("tenant_id", "user_id", {
        limit: 1,
    });
}
main();
