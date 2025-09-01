import OauthClientCredentialsDefault

let client = SeedOauthClientCredentialsDefaultClient()

private func main() async throws {
    try await client.nestedNoAuth.api.getSomething(

    )
}

try await main()
