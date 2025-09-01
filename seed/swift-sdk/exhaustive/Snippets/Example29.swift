import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.endpoints.primitive.getAndReturnString(request: "string")
}

try await main()
