import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.getToken(
            audience: .pets,
            request: .init(
                clientId: "client_id",
                clientSecret: "client_secret",
                scopes: "scopes",
                grantType: .clientCredentials,
                tenant: "tenant",
                optionalHint: "optional_hint"
            )
        )
    }
}
