import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.problem.deleteProblem(problemId: "problemId")
}

try await main()
