import OauthClientCredentialsDefault

let client = SeedOauthClientCredentialsDefaultClient()

private func main() async throws {
    try await client.auth.getToken(
        request: .init(
            clientId: "client_id",
            clientSecret: "client_secret",
            grantType: .clientCredentials
        )
    )
}

try await main()
