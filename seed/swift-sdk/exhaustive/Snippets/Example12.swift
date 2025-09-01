import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.httpMethods.testPut(
    id: "id",
    request: ObjectWithRequiredField(
        string: "string"
    )
)
