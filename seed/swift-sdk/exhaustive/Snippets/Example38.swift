import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.put.add(
    id: "id",
    request: .init(id: "id")
)
