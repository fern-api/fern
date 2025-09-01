import Streaming

let client = SeedStreamingClient()

private func main() async throws {
    try await client.dummy.generate(
        request: .init(
            stream: ,
            numEvents: 5
        )
    )
}

try await main()
