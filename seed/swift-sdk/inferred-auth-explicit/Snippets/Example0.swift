import InferredAuthExplicit

let client = SeedInferredAuthExplicitClient()

try await client.auth.getTokenWithClientCredentials(
    request: .init(
        xApiKey: "X-Api-Key",
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    )
)
