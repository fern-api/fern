import Foundation
import OauthClientCredentialsMandatoryAuth

enum Example0 {
    static func snippet() async throws {
        let client = OauthClientCredentialsMandatoryAuthClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.getTokenWithClientCredentials(request: .init(
            clientId: "my_oauth_app_123",
            clientSecret: "sk_live_abcdef123456789",
            audience: .httpsApiExampleCom,
            grantType: .clientCredentials,
            scope: "read:users"
        ))
    }
}
