import OauthClientCredentialsDefault

let client = SeedOauthClientCredentialsDefaultClient()

try await client.auth.getToken(
    request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        grantType: .clientCredentials
    )
)
