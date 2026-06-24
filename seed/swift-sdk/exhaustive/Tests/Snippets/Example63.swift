import Foundation
import Exhaustive

enum Example63 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.inlinedRequests.postWithArrayBodyAndHeaders(
            xCustomHeader: "X-Custom-Header",
            request: [
                "string",
                "string"
            ]
        )
    }
}
