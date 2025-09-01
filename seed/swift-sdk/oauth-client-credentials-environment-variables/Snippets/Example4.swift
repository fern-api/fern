import OauthClientCredentialsEnvironmentVariables

let client = SeedOauthClientCredentialsEnvironmentVariablesClient()

private func main() async throws {
    try await client.simple.getSomething(

    )
}

try await main()
