import Foundation
import OauthClientCredentials

enum Example0 {
    static func snippet() async throws {
        let client = OauthClientCredentialsClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.getTokenWithClientCredentials(request: .init(
            cid: "cid",
            csr: "csr",
            scp: "scp",
            entityId: "entity_id",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials,
            scope: "scope"
        ))
    }
}
