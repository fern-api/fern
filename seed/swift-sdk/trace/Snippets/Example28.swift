import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.v2.problem.getProblems(

    )
}

try await main()
