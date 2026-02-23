import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.object.getAndReturnWithMapOfMap(request: ObjectWithMapOfMap(
        map: [
            "map": [
                "map": "map"
            ]
        ]
    ))
}

try await main()
