import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.httpMethods.testGet(
    id: "id"
)
