import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.submission.stopExecutionSession(sessionId: "sessionId")
}

try await main()
