import Foundation
import Trace

enum Example25 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.submission.getExecutionSession(sessionId: "sessionId")
    }
}
