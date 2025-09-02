import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    try await client.problem.deleteProblem(problemId: "problemId")
}

try await main()
