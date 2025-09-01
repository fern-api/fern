import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.params.modifyWithPath(
    param: "param",
    request: "string"
)
