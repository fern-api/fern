import Foundation
import MyCustomModule

enum Example9 {
    static func snippet() async throws {
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.getConnection(
            connectionId: "connectionId",
            fields: "fields"
        )
    }
}
