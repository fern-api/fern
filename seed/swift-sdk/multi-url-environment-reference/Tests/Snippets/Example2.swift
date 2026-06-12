import Foundation
import Api

enum Example2 {
    static func snippet() async throws {
        let client = ApiClient(token: "<token>")

        _ = try await client.auth.gettoken(request: .init(
            clientId: "client_id",
            clientSecret: "client_secret"
        ))
    }
}
