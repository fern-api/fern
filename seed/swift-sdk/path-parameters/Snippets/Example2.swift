import PathParameters

let client = SeedPathParametersClient()

try await client.organizations.searchOrganizations(
    organizationId: "organization_id",
    request: .init(
        organizationId: "organization_id",
        limit: 1
    )
)
