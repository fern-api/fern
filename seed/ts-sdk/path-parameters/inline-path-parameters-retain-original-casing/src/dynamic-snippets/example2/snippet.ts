import { SeedPathParametersClient } from "../..";

async function main() {
    const client = new SeedPathParametersClient({
        environment: "https://api.fern.com",
    });
    await client.organizations.searchOrganizations("tenant_id", "organization_id", {
        limit: 1,
    });
}
main();
