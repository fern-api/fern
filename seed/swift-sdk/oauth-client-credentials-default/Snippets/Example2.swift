import OauthClientCredentialsDefault

private func main() async throws {
    let client = SeedOauthClientCredentialsDefaultClient()

    try await client.nested.api.getSomething()
}

try await main()
