import OauthClientCredentials

private func main() async throws {
    let client = SeedOauthClientCredentialsClient()

    try await client.auth.getTokenWithClientCredentials(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    ))
}

try await main()
