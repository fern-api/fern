import OauthClientCredentialsWithVariables

private func main() async throws {
    let client = SeedOauthClientCredentialsWithVariablesClient()

    try await client.nested.api.getSomething()
}

try await main()
