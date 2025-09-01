import NullableOptional

let client = SeedNullableOptionalClient()

try await client.nullableOptional.filterByRole(
    request: .init(
        role: .admin,
        status: .active,
        secondaryRole: .admin
    )
)
