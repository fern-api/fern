import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.v2.problem.getProblemVersion(
        problemId: "problemId",
        problemVersion: 1
    )
}

try await main()
