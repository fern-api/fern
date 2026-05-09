import Foundation
import Version

enum Example0 {
    static func snippet() async throws {
        let client = VersionClient(baseURL: "https://api.fern.com")

        _ = try await client.user.getUser(userId: "userId")
    }
}
