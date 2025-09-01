import NullableOptional

let client = SeedNullableOptionalClient()

try await client.nullableOptional.getNotificationSettings(
    userId: "userId"
)
