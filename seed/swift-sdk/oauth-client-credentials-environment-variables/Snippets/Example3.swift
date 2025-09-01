import OauthClientCredentialsEnvironmentVariables

let client = SeedOauthClientCredentialsEnvironmentVariablesClient()

private func main() async throws {
    try await client.nested.api.getSomething(

    )
}

try await main()
