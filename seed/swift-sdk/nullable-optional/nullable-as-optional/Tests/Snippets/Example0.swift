import Foundation
import NullableOptional

enum Example0 {
    static func snippet() async throws {
        let client = NullableOptionalClient(baseURL: "https://api.fern.com")

        _ = try await client.nullableOptional.getUser(userId: "userId")
    }
}
