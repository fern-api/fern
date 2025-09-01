import ServerSentEvents

let client = SeedServerSentEventsClient()

private func main() async throws {
    try await client.completions.stream(
        request: .init(query: "foo")
    )
}

try await main()
