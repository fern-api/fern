import Foundation
import InferredAuthImplicit

enum Example1 {
    static func snippet() async throws {
        let client = InferredAuthImplicitClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.refreshToken(
            xApiKey: "X-Api-Key",
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret",
                refreshToken: "refresh_token",
                audience: .httpsApiExampleCom,
                grantType: .refreshToken,
                scope: "scope"
            )
        )
    }
}
