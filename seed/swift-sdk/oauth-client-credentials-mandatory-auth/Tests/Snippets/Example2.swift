import Foundation
import OauthClientCredentialsMandatoryAuth

enum Example2 {
    static func snippet() async throws {
        let client = OauthClientCredentialsMandatoryAuthClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.refreshToken(request: .init(
            clientId: "my_oauth_app_123",
            clientSecret: "sk_live_abcdef123456789",
            refreshToken: "refresh_token",
            audience: .httpsApiExampleCom,
            grantType: .refreshToken,
            scope: "read:users"
        ))
    }
}
