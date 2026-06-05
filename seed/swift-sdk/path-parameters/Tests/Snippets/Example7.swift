import Foundation
import PathParameters

enum Example7 {
    static func snippet() async throws {
        let client = PathParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.user.getUserMetadata(
            tenantId: "tenant_id",
            userId: "user_id",
            version: "1"
        )
    }
}
