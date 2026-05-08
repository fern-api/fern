import Foundation
import AnyAuth

private func main() async throws {
    let client = AnyAuthClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.auth.getToken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials
    ))
}

try await main()
