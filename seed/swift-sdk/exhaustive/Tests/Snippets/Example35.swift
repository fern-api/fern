import Foundation
import Exhaustive

enum Example35 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.params.getWithQuery(
            query: "query",
            number: 1
        )
    }
}
