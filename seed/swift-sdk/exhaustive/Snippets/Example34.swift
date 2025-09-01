import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.primitive.getAndReturnDatetime(
        request: Date(timeIntervalSince1970: 1705311000)
    )
}

try await main()
