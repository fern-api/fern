import Foundation
import OauthClientCredentialsWithVariables

private func main() async throws {
    let client = OauthClientCredentialsWithVariablesClient()

    try await client.auth.getTokenWithClientCredentials(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    ))
}

try await main()
