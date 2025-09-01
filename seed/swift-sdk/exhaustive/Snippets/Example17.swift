import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.object.getAndReturnWithMapOfMap(
        request: ObjectWithMapOfMap(
            map: [
                "map": [
                    "map": "map"
                ]
            ]
        )
    )
}

try await main()
