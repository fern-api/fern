import { SeedPathParametersClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedPathParametersClient({
        environment: "https://api.fern.com",
    });
    
    await client.organizations.getOrganization("tenant_id", "organization_id");
}
main();
