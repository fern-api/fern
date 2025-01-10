import { SeedPathParametersClient } from "../..";

async function main(): Promise<void> {
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
