import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.object.getAndReturnWithRequiredField(
    request: ObjectWithRequiredField(
        string: "string"
    )
)
