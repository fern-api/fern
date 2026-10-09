import Foundation
import PathParameters

enum Example4 {
    static func snippet() async throws {
        let client = PathParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.user.createUser(
            tenantId: "tenant_id",
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
