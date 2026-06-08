import Foundation
import Api

enum Example3 {
    static func snippet() async throws {
        let client = ApiClient()

        _ = try await client.getUser(userId: "userId")
    }
}
