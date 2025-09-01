import Literal

private func main() async throws {
    let client = SeedLiteralClient()

    try await client.headers.send(request: .init(
        endpointVersion: .02122024,
        async: ,
        query: "What is the weather today"
    ))
}

try await main()
