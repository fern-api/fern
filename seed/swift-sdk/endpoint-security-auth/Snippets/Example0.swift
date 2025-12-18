import Foundation
import EndpointSecurityAuth

private func main() async throws {
    let client = EndpointSecurityAuthClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.auth.getToken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    ))
}

try await main()
