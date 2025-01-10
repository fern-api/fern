import { SeedPathParametersClient } from "../..";

async function main() {
    const client = new SeedPathParametersClient({
        environment: "https://api.fern.com",
    });
    await client.organizations.getOrganizationUser({
        tenant_id: "tenant_id",
        organization_id: "organization_id",
        user_id: "user_id",
    });
}
main();
