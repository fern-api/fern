import Trace

let client = SeedTraceClient(token: "<token>")

try await client.submission.createExecutionSession(
    language: .java
)
