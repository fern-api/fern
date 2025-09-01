import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.primitive.getAndReturnBase64(
        request: "SGVsbG8gd29ybGQh"
    )
}

try await main()
