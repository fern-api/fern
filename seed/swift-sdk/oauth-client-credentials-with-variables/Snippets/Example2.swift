import OauthClientCredentialsWithVariables

let client = SeedOauthClientCredentialsWithVariablesClient()

private func main() async throws {
    try await client.nestedNoAuth.api.getSomething(

    )
}

try await main()
