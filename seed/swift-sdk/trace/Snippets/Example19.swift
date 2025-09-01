import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.problem.deleteProblem(
        problemId: "problemId"
    )
}

try await main()
