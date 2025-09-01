import Literal

private func main() async throws {
    let client = SeedLiteralClient()

    try await client.headers.send(request: .init(
        endpointVersion: .02122024,
        async: ,
        query: "query"
    ))
}

try await main()
