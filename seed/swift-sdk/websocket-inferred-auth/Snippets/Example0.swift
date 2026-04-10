import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        apiKey: "<X-Api-Key>"
    )

    _ = try await client.auth.gettokenwithclientcredentials(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials
    ))
}

try await main()
