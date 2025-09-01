import OauthClientCredentialsWithVariables

let client = SeedOauthClientCredentialsWithVariablesClient()

try await client.auth.getTokenWithClientCredentials(
    request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    )
)
