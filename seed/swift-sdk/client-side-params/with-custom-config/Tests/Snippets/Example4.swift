import Foundation
import MyCustomModule

enum Example4 {
    static func snippet() async throws {
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.getUserById(
            userId: "userId",
            fields: "fields",
            includeFields: true
        )
    }
}
