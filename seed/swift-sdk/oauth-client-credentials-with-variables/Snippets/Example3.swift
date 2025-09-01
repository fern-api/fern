import OauthClientCredentialsWithVariables

let client = SeedOauthClientCredentialsWithVariablesClient()

private func main() async throws {
    try await client.nested.api.getSomething(

    )
}

try await main()
