import Foundation
import Trace

enum Example34 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.v2.v3.problem.getLightweightProblems()
    }
}
