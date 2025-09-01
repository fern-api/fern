import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.params.getWithPath(
    param: "param"
)
