import OauthClientCredentials

let client = SeedOauthClientCredentialsClient()

try await client.auth.getTokenWithClientCredentials(
    request: .init(
        cid: "cid",
        csr: "csr",
        scp: "scp",
        entityId: "entity_id",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    )
)
