import Foundation
import WebsocketAuth

enum Example0 {
    static func snippet() async throws {
        let client = WebsocketAuthClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.getTokenWithClientCredentials(request: .init(
            clientId: "client_id",
            clientSecret: "client_secret",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials,
            scope: "scope"
        ))
    }
}
