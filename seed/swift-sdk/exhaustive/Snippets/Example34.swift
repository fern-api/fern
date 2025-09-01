import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.primitive.getAndReturnDatetime(
    request: Date(timeIntervalSince1970: 1705311000)
)
