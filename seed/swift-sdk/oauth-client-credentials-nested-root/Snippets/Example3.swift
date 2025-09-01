import OauthClientCredentials

let client = SeedOauthClientCredentialsClient()

private func main() async throws {
    try await client.simple.getSomething(

    )
}

try await main()
