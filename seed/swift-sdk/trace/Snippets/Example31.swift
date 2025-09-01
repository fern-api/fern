import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.v2.problem.getLightweightProblems()
}

try await main()
