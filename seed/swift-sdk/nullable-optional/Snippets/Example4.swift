import NullableOptional

let client = SeedNullableOptionalClient()

try await client.nullableOptional.searchUsers(
    request: .init(
        query: "query",
        department: "department",
        role: "role",
        isActive: True
    )
)
