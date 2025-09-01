import OauthClientCredentialsWithVariables

private func main() async throws {
    let client = SeedOauthClientCredentialsWithVariablesClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
