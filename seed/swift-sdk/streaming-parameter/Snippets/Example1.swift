import Streaming

let client = SeedStreamingClient()

try await client.dummy.generate(
    request: .init(
        stream: True,
        numEvents: 1
    )
)
