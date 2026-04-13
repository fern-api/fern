import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        apiKey: "<X-Api-Key>"
    )

    _ = try await client.auth.refreshtoken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        refreshToken: "refresh_token",
        audience: .httpsApiExampleCom,
        grantType: .refreshToken
    ))
}

try await main()
