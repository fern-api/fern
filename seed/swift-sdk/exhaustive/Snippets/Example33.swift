import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.primitive.getAndReturnBool(
        request: True
    )
}

try await main()
