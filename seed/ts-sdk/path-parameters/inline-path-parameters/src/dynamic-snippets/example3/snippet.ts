import { SeedPathParametersClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedPathParametersClient({
        environment: "https://api.fern.com",
    });
    
    await client.user.getUser({
        tenantId: "tenant_id",
        userId: "user_id",
    });
}
main();
