import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.container.getAndReturnListOfPrimitives(
    request: [
        "string",
        "string"
    ]
)
