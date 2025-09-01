import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.endpoints.primitive.getAndReturnBool(request: True)
}

try await main()
