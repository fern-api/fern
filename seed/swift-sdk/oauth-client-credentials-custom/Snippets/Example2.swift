import OauthClientCredentials

private func main() async throws {
    let client = SeedOauthClientCredentialsClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
