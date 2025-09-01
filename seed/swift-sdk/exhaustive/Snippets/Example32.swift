import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.primitive.getAndReturnDouble(
        request: 1.1
    )
}

try await main()
