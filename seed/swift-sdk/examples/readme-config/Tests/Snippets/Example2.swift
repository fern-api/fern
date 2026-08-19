import Foundation
import Examples

enum Example2 {
    static func snippet() async throws {
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.createType(request: `Type`.basicType(
            .primitive
        ))
    }
}
