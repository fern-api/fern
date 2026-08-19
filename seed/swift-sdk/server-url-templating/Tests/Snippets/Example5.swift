import Foundation
import Api

enum Example5 {
    static func snippet() async throws {
        let client = ApiClient()

        _ = try await client.getToken(request: .init(
            clientId: "client_id",
            clientSecret: "client_secret"
        ))
    }
}
