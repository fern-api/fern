import OauthClientCredentials

private func main() async throws {
    let client = SeedOauthClientCredentialsClient()

    try await client.nested.api.getSomething()
}

try await main()
