import Foundation
import MyCustomModule

enum Example2 {
    static func snippet() async throws {
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.searchResources(
            limit: 1,
            offset: 1,
            request: .init(
                query: "query",
                filters: [
                    "filters": .object([
                        "key": .string("value")
                    ])
                ]
            )
        )
    }
}
