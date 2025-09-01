import OauthClientCredentials

let client = SeedOauthClientCredentialsClient()

try await client.auth.getToken(
    request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    )
)
