import OauthClientCredentialsDefault

private func main() async throws {
    let client = SeedOauthClientCredentialsDefaultClient()

    try await client.simple.getSomething()
}

try await main()
