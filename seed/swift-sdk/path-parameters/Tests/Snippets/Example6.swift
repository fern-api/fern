import Foundation
import PathParameters

enum Example6 {
    static func snippet() async throws {
        let client = PathParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.user.searchUsers(
            userId: "user_id",
            limit: 1
        )
    }
}
