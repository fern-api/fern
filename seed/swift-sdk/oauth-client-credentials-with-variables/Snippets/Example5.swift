import OauthClientCredentialsWithVariables

let client = SeedOauthClientCredentialsWithVariablesClient()

private func main() async throws {
    try await client.simple.getSomething(

    )
}

try await main()
