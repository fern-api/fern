import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = OauthClientCredentialsClient(baseURL: "https://api.fern.com")

    try await client.auth.refreshToken(request: .init(
        clientId: "my_oauth_app_123",
        clientSecret: "sk_live_abcdef123456789",
        refreshToken: "refresh_token",
        audience: .httpsApiExampleCom,
        grantType: .refreshToken,
        scope: "read:users"
    ))
}

try await main()
