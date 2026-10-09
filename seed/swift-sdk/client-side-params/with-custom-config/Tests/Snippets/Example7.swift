import Foundation
import MyCustomModule

enum Example7 {
    static func snippet() async throws {
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.deleteUser(userId: "userId")
    }
}
