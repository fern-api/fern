import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.primitive.getAndReturnDouble(
    request: 1.1
)
