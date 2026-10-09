import Foundation
import Trace

enum Example32 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.v2.problem.getLatestProblem(problemId: "problemId")
    }
}
