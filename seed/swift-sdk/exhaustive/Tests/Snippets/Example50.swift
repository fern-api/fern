import Foundation
import Exhaustive

enum Example50 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.primitive.getAndReturnDatetime(request: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601))
    }
}
