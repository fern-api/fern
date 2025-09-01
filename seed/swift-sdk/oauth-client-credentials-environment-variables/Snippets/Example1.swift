import OauthClientCredentialsEnvironmentVariables

let client = SeedOauthClientCredentialsEnvironmentVariablesClient()

try await client.auth.refreshToken(
    request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        refreshToken: "refresh_token",
        audience: .httpsApiExampleCom,
        grantType: .refreshToken,
        scope: "scope"
    )
)
