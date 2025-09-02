import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = OauthClientCredentialsClient()

    try await client.auth.getToken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    ))
}

try await main()
