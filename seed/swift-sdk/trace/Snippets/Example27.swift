import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.v2.problem.getLightweightProblems(

    )
}

try await main()
