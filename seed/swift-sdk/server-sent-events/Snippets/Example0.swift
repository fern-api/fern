import ServerSentEvents

let client = SeedServerSentEventsClient()

try await client.completions.stream(
    request: .init(query: "query")
)
