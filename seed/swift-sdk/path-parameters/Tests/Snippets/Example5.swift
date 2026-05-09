import Foundation
import PathParameters

enum Example5 {
    static func snippet() async throws {
        let client = PathParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.user.updateUser(
            userId: "user_id",
            request: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        )
    }
}
