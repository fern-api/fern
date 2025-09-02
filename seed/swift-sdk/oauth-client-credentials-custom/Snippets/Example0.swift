import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = SeedOauthClientCredentialsClient()

    try await client.auth.getTokenWithClientCredentials(request: .init(
        cid: "cid",
        csr: "csr",
        scp: "scp",
        entityId: "entity_id",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    ))
}

try await main()
