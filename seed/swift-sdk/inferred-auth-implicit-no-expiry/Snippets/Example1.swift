import Foundation
import InferredAuthImplicitNoExpiry

private func main() async throws {
    let client = InferredAuthImplicitNoExpiryClient(baseURL: "https://api.fern.com")

    _ = try await client.auth.refreshToken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        refreshToken: "refresh_token",
        audience: .httpsApiExampleCom,
        grantType: .refreshToken,
        scope: "scope"
    ))
}

try await main()
