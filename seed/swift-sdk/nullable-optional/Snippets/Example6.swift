import NullableOptional

let client = SeedNullableOptionalClient()

private func main() async throws {
    try await client.nullableOptional.getComplexProfile(
        profileId: "profileId"
    )
}

try await main()
