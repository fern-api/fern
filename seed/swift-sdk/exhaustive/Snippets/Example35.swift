import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.primitive.getAndReturnDate(
        request: Date(timeIntervalSince1970: 1673740800)
    )
}

try await main()
