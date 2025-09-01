import NullableOptional

let client = SeedNullableOptionalClient()

private func main() async throws {
    try await client.nullableOptional.filterByRole(
        request: .init(
            role: .admin,
            status: .active,
            secondaryRole: .admin
        )
    )
}

try await main()
