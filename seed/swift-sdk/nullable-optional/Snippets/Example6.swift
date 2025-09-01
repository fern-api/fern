import NullableOptional

let client = SeedNullableOptionalClient()

try await client.nullableOptional.getComplexProfile(
    profileId: "profileId"
)
