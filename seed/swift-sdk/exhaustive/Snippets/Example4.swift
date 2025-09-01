import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.endpoints.container.getAndReturnMapPrimToPrim(request: [
        "string": "string"
    ])
}

try await main()
