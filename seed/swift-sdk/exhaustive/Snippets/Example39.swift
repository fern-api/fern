import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.union.getAndReturnUnion(
    request: Animal.dog(
        .init(
            name: "name",
            likesToWoof: True
        )
    )
)
