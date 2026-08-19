import Foundation
import Trace

enum Example10 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.homepage.setHomepageProblems(request: [
            "string",
            "string"
        ])
    }
}
