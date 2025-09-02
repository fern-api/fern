import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    try await client.v2.problem.getProblems()
}

try await main()
