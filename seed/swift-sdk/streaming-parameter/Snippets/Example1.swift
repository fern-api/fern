import Streaming

let client = SeedStreamingClient()

private func main() async throws {
    try await client.dummy.generate(
        request: .init(
            stream: True,
            numEvents: 1
        )
    )
}

try await main()
