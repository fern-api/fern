import Foundation
import Exhaustive

enum Example36 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.params.getWithAllowMultipleQuery()
    }
}
