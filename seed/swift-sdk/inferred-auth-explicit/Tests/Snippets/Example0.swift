import Foundation
import InferredAuthExplicit

enum Example0 {
    static func snippet() async throws {
        let client = InferredAuthExplicitClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.getTokenWithClientCredentials(
            xApiKey: "X-Api-Key",
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret",
                audience: .httpsApiExampleCom,
                grantType: .clientCredentials,
                scope: "scope"
            )
        )
    }
}
