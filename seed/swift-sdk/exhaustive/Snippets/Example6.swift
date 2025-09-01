import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.container.getAndReturnOptional(
    request: ObjectWithRequiredField(
        string: "string"
    )
)
