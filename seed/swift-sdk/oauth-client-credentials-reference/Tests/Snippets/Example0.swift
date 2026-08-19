import Foundation
import OauthClientCredentialsReference

enum Example0 {
    static func snippet() async throws {
        let client = OauthClientCredentialsReferenceClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.getToken(request: GetTokenRequest(
            clientId: "client_id",
            clientSecret: "client_secret"
        ))
    }
}
