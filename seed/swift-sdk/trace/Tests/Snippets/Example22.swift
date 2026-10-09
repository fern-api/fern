import Foundation
import Trace

enum Example22 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.problem.deleteProblem(problemId: "problemId")
    }
}
