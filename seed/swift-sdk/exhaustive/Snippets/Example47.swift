import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.object.getAndReturnWithMapOfMap(request: TypesObjectWithMapOfMap(
        map: [
            "key": [
                "key": "value"
            ]
        ]
    ))
}

try await main()
