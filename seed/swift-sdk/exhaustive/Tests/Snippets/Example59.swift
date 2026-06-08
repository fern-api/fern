import Foundation
import Exhaustive

enum Example59 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.urls.withUnderscores()
    }
}
