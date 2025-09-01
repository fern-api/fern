import PathParameters

let client = SeedPathParametersClient()

private func main() async throws {
    try await client.organizations.getOrganization(
        tenantId: "tenant_id",
        organizationId: "organization_id"
    )
}

try await main()
