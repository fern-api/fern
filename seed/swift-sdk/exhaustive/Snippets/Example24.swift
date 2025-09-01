import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.params.getWithQuery(
        request: .init(
            query: "query",
            number: 1
        )
    )
}

try await main()
