import PathParameters

let client = SeedPathParametersClient()

private func main() async throws {
    try await client.organizations.getOrganizationUser(
        organizationId: "organization_id",
        userId: "user_id",
        request: .init(
            organizationId: "organization_id",
            userId: "user_id"
        )
    )
}

try await main()
