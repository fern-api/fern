import Foundation
import Exhaustive

enum Example33 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.pagination.listItems(
            cursor: "cursor",
            limit: 1
        )
    }
}
