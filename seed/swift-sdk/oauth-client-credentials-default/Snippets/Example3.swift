import OauthClientCredentialsDefault

let client = SeedOauthClientCredentialsDefaultClient()

private func main() async throws {
    try await client.simple.getSomething(

    )
}

try await main()
