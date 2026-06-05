import Foundation
import NullableOptional

enum Example10 {
    static func snippet() async throws {
        let client = NullableOptionalClient(baseURL: "https://api.fern.com")

        _ = try await client.nullableOptional.getNotificationSettings(userId: "userId")
    }
}
