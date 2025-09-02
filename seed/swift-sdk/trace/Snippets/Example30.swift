import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.v2.problem.getProblemVersion(
        problemId: "problemId",
        problemVersion: 1
    )
}

try await main()
