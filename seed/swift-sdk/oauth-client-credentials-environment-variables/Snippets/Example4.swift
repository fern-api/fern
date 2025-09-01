import OauthClientCredentialsEnvironmentVariables

private func main() async throws {
    let client = SeedOauthClientCredentialsEnvironmentVariablesClient()

    try await client.simple.getSomething()
}

try await main()
