import Foundation
import PathParameters

enum Example3 {
    static func snippet() async throws {
        let client = PathParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.user.getUser(
            tenantId: "tenant_id",
            userId: "user_id"
        )
    }
}
