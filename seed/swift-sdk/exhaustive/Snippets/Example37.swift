import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.primitive.getAndReturnBase64(
    request: "SGVsbG8gd29ybGQh"
)
