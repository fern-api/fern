import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.httpMethods.testPost(
    request: ObjectWithRequiredField(
        string: "string"
    )
)
