import Foundation
import Examples

enum Example10 {
    static func snippet() async throws {
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.health.service.check(id: "id")
    }
}
