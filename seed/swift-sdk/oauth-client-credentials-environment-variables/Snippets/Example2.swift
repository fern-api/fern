import OauthClientCredentialsEnvironmentVariables

let client = SeedOauthClientCredentialsEnvironmentVariablesClient()

private func main() async throws {
    try await client.nestedNoAuth.api.getSomething(

    )
}

try await main()
