import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.v2.problem.getLatestProblem(problemId: "problemId")
}

try await main()
