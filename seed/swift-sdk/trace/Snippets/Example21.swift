import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    try await client.submission.createExecutionSession(language: .java)
}

try await main()
