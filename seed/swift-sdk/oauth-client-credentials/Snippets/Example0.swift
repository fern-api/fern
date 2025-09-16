import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = OauthClientCredentialsClient(baseURL: "https://api.fern.com")

    try await client.auth.getTokenWithClientCredentials(request: .init(
        clientId: "my_oauth_app_123",
        clientSecret: "sk_live_abcdef123456789",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "read:users"
    ))
}

try await main()
