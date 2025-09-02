import Foundation
import InferredAuthExplicit

private func main() async throws {
    let client = SeedInferredAuthExplicitClient()

    try await client.auth.refreshToken(request: .init(
        xApiKey: "X-Api-Key",
        clientId: "client_id",
        clientSecret: "client_secret",
        refreshToken: "refresh_token",
        audience: .httpsApiExampleCom,
        grantType: .refreshToken,
        scope: "scope"
    ))
}

try await main()
