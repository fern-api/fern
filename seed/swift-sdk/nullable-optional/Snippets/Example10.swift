import NullableOptional

let client = SeedNullableOptionalClient()

private func main() async throws {
    try await client.nullableOptional.getNotificationSettings(
        userId: "userId"
    )
}

try await main()
