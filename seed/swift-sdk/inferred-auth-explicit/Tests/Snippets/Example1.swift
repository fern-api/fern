import Foundation
import InferredAuthExplicit

enum Example1 {
    static func snippet() async throws {
        let client = InferredAuthExplicitClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.refreshToken(request: .init(
            clientId: "client_id",
            clientSecret: "client_secret",
            refreshToken: "refresh_token",
            audience: .httpsApiExampleCom,
            grantType: .refreshToken,
            scope: "scope"
        ))
    }
}
