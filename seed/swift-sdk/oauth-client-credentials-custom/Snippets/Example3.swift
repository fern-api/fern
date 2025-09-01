import OauthClientCredentials

let client = SeedOauthClientCredentialsClient()

private func main() async throws {
    try await client.nested.api.getSomething(

    )
}

try await main()
