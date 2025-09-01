import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.container.getAndReturnMapPrimToPrim(
        request: [
            "string": "string"
        ]
    )
}

try await main()
