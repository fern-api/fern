import OauthClientCredentialsDefault

private func main() async throws {
    let client = SeedOauthClientCredentialsDefaultClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
