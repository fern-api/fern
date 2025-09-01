import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.endpoints.object.getAndReturnWithMapOfMap(
    request: ObjectWithMapOfMap(
        map: [
            "map": [
                "map": "map"
            ]
        ]
    )
)
