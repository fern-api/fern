import Foundation
import MultiLineDocs

enum Example0 {
    static func snippet() async throws {
        let client = MultiLineDocsClient(baseURL: "https://api.fern.com")

        _ = try await client.user.getUser(userId: "userId")
    }
}
