import PathParameters

let client = SeedPathParametersClient()

private func main() async throws {
    try await client.organizations.searchOrganizations(
        organizationId: "organization_id",
        request: .init(
            organizationId: "organization_id",
            limit: 1
        )
    )
}

try await main()
