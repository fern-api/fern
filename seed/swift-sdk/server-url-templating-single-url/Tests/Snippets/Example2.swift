import Foundation
import Api

enum Example2 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.getUser(userId: "userId")
    }
}
