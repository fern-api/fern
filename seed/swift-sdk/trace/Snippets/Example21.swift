import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.submission.createExecutionSession(
        language: .java
    )
}

try await main()
