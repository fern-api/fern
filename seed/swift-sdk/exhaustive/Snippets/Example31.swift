import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.primitive.getAndReturnLong(
    request: 1000000
)
