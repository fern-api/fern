import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.v2.problem.getLatestProblem(
        problemId: "problemId"
    )
}

try await main()
