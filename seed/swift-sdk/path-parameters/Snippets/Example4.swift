import PathParameters

let client = SeedPathParametersClient()

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
