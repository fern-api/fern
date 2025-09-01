import OauthClientCredentials

let client = SeedOauthClientCredentialsClient()

private func main() async throws {
    try await client.nestedNoAuth.api.getSomething(

    )
}

try await main()
