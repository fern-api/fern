import ExtraProperties

let client = SeedExtraPropertiesClient()

private func main() async throws {
    try await client.user.createUser(
        request: .init(
            type: .createUserRequest,
            version: .v1,
            name: "name"
        )
    )
}

try await main()
