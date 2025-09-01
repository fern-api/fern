import Streaming

let client = SeedStreamingClient()

private func main() async throws {
    try await client.dummy.generateStream(
        request: .init(
            stream: ,
            numEvents: 1
        )
    )
}

try await main()
