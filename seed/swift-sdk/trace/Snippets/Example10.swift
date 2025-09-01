import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.homepage.setHomepageProblems(
        request: [
            "string",
            "string"
        ]
    )
}

try await main()
