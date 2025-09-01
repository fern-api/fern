import OauthClientCredentialsDefault

let client = SeedOauthClientCredentialsDefaultClient()

private func main() async throws {
    try await client.nested.api.getSomething(

    )
}

try await main()
