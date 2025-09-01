import NullableOptional

let client = SeedNullableOptionalClient()

private func main() async throws {
    try await client.nullableOptional.listUsers(
        request: .init(
            limit: 1,
            offset: 1,
            includeDeleted: True,
            sortBy: "sortBy"
        )
    )
}

try await main()
