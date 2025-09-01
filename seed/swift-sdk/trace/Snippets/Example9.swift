import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.homepage.getHomepageProblems(

    )
}

try await main()
