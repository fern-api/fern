import Foundation
import OauthClientCredentialsDefault

private func main() async throws {
    let client = OauthClientCredentialsDefaultClient(baseURL: "https://api.fern.com")

    try await client.auth.getToken(request: .init(
        clientId: "client_id",
        clientSecret: "client_secret",
        grantType: .clientCredentials
    ))
}

try await main()
