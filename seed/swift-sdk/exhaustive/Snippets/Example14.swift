import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.httpMethods.testDelete(
    id: "id"
)
