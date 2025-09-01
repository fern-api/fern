import Streaming

private func main() async throws {
    let client = SeedStreamingClient()

    try await client.dummy.generate(request: .init(
        stream: True,
        numEvents: 1
    ))
}

try await main()
