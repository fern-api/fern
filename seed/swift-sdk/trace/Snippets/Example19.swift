import Trace

let client = SeedTraceClient(token: "<token>")

try await client.problem.deleteProblem(
    problemId: "problemId"
)
