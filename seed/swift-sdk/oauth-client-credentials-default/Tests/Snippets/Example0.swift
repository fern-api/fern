import Foundation
import OauthClientCredentialsDefault

enum Example0 {
    static func snippet() async throws {
        let client = OauthClientCredentialsDefaultClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.getToken(request: .init(
            clientId: "client_id",
            clientSecret: "client_secret",
            grantType: .clientCredentials
        ))
    }
}
