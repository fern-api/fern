import Foundation
import Examples

enum Example12 {
    static func snippet() async throws {
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.health.service.ping()
    }
}
