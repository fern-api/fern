import Foundation
import Examples

enum Example18 {
    static func snippet() async throws {
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.getMetadata(shallow: true)
    }
}
