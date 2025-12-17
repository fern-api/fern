import Foundation
import OauthClientCredentialsReference

private func main() async throws {
    let client = OauthClientCredentialsReferenceClient(baseURL: "https://api.fern.com")

    _ = try await client.auth.getToken(request: GetTokenRequest(
        clientId: "client_id",
        clientSecret: "client_secret"
    ))
}

try await main()
