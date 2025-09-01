import PathParameters

let client = SeedPathParametersClient()

try await client.organizations.getOrganization(
    tenantId: "tenant_id",
    organizationId: "organization_id"
)
