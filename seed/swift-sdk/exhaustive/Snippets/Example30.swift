import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.primitive.getAndReturnInt(
        request: 1
    )
}

try await main()
