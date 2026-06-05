import Foundation
import Trace

enum Example33 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.v2.problem.getProblemVersion(
            problemId: "problemId",
            problemVersion: 1
        )
    }
}
