import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.submission.stopExecutionSession(
        sessionId: "sessionId"
    )
}

try await main()
