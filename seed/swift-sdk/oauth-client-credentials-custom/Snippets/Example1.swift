import Foundation
import OauthClientCredentials

private func main() async throws {
    let client = OauthClientCredentialsClient(baseURL: "https://api.fern.com")

    try await client.auth.getTokenWithClientCredentials(request: .init(
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    ))
}

try await main()
