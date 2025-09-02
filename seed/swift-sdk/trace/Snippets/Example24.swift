import Foundation
import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.submission.getExecutionSessionsState()
}

try await main()
