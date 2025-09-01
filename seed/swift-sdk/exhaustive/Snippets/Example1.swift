import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.container.getAndReturnListOfObjects(
    request: [
        ObjectWithRequiredField(
            string: "string"
        ),
        ObjectWithRequiredField(
            string: "string"
        )
    ]
)
