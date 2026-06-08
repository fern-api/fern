import Foundation
import Examples

enum Example21 {
    static func snippet() async throws {
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.refreshToken(request: RefreshTokenRequest(
            ttl: 420
        ))
    }
}
