import Foundation
import InferredAuthImplicit

enum Example0 {
    static func snippet() async throws {
        let client = InferredAuthImplicitClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.getTokenWithClientCredentials(request: GetTokenRequest(
            clientId: "client_id",
            clientSecret: "client_secret",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials,
            scope: "scope"
        ))
    }
}
