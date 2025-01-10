import { SeedPathParametersClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedPathParametersClient({
        environment: "https://api.fern.com",
    });
    
    await client.organizations.getOrganizationUser({
        tenantId: "tenant_id",
        organizationId: "organization_id",
        userId: "user_id",
    });
}
main();
