import Foundation
import MyCustomModule

enum Example8 {
    static func snippet() async throws {
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.listConnections(
            strategy: "strategy",
            name: "name",
            fields: "fields"
        )
    }
}
