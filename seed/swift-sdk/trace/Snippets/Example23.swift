import Trace

let client = SeedTraceClient(token: "<token>")

try await client.submission.stopExecutionSession(
    sessionId: "sessionId"
)
