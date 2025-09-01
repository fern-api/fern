import NullableOptional

let client = SeedNullableOptionalClient()

try await client.nullableOptional.getUser(
    userId: "userId"
)
