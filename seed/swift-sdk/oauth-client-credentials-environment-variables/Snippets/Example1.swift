import Foundation
import OauthClientCredentialsEnvironmentVariables

private func main() async throws {
    let client = OauthClientCredentialsEnvironmentVariablesClient(baseURL: "https://api.fern.com")

    try await client.auth.getTokenWithClientCredentials(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    ))
}

try await main()
