import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>",
        apiKey: "<X-API-Key>"
    )

    _ = try await client.auth.gettoken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials
    ))
}

try await main()
