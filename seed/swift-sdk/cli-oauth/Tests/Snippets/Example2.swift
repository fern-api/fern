import Foundation
import Api

enum Example2 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.auth.refreshToken(request: .init(
            refreshToken: "refresh_token",
            grantType: .refreshToken
        ))
    }
}
