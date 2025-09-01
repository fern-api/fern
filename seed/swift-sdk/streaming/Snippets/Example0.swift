import Streaming

let client = SeedStreamingClient()

try await client.dummy.generateStream(
    request: .init(
        stream: ,
        numEvents: 1
    )
)
