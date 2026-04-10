import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithMapOfMap(request: TypesObjectWithMapOfMap(
        map: [
            "map": [
                "map": "map"
            ]
        ]
    ))
}

try await main()
