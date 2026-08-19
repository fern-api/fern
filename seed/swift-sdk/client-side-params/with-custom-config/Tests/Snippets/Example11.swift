import Foundation
import MyCustomModule

enum Example11 {
    static func snippet() async throws {
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.getClient(
            clientId: "clientId",
            fields: "fields",
            includeFields: true
        )
    }
}
