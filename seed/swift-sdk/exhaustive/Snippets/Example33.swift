import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.primitive.getAndReturnBool(
    request: True
)
