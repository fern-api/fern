import Foundation
import InferredAuthImplicit

private func main() async throws {
    let client = InferredAuthImplicitClient(baseURL: "https://api.fern.com")

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
