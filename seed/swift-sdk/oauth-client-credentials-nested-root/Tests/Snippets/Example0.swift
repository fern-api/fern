import Foundation
import OauthClientCredentials

enum Example0 {
    static func snippet() async throws {
        let client = OauthClientCredentialsClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.getToken(request: .init(
            clientId: "client_id",
            clientSecret: "client_secret",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials,
            scope: "scope"
        ))
    }
}
