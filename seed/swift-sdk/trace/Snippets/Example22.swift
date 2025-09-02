import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    try await client.submission.getExecutionSession(sessionId: "sessionId")
}

try await main()
