import PathParameters

let client = SeedPathParametersClient()

private func main() async throws {
    try await client.user.createUser(
        tenantId: "tenant_id",
        request: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        )
    )
}

try await main()
