import Trace

let client = SeedTraceClient(token: "<token>")

try await client.v2.problem.getProblemVersion(
    problemId: "problemId",
    problemVersion: 1
)
