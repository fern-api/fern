import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.submission.getExecutionSessionsState(

    )
}

try await main()
