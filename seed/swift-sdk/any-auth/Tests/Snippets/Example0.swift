import Foundation
import AnyAuth

enum Example0 {
    static func snippet() async throws {
        let client = AnyAuthClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.auth.getToken(request: .init(
            clientId: "client_id",
            clientSecret: "client_secret",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials
        ))
    }
}
