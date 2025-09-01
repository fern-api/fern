import Streaming

let client = SeedStreamingClient()

try await client.dummy.generate(
    request: .init(
        stream: ,
        numEvents: 1
    )
)
