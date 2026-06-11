import Foundation
import Exhaustive

enum Example54 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.put.add(id: "id")
    }
}
