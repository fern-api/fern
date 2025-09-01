import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.container.getAndReturnMapOfPrimToObject(
    request: [
        "string": ObjectWithRequiredField(
            string: "string"
        )
    ]
)
