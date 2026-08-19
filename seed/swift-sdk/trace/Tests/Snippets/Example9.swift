import Foundation
import Trace

enum Example9 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.homepage.getHomepageProblems()
    }
}
