import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.primitive.getAndReturnDate(
    request: Date(timeIntervalSince1970: 1673740800)
)
