import NullableOptional

private func main() async throws {
    let client = SeedNullableOptionalClient()

    try await client.nullableOptional.searchUsers(request: .init(
        query: "query",
        department: "department",
        role: "role",
        isActive: True
    ))
}

try await main()
