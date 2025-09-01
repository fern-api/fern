import OauthClientCredentialsEnvironmentVariables

private func main() async throws {
    let client = SeedOauthClientCredentialsEnvironmentVariablesClient()

    try await client.nestedNoAuth.api.getSomething()
}

try await main()
