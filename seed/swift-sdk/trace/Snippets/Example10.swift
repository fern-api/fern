import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.homepage.setHomepageProblems(request: [
        "string",
        "string"
    ])
}

try await main()
