import NullableOptional

let client = SeedNullableOptionalClient()

private func main() async throws {
    try await client.nullableOptional.searchUsers(
        request: .init(
            query: "query",
            department: "department",
            role: "role",
            isActive: True
        )
    )
}

try await main()
