import Foundation
import Nullable

enum Example0 {
    static func snippet() async throws {
        let client = NullableClient(baseURL: "https://api.fern.com")

        _ = try await client.nullable.getUsers(
            avatar: "avatar",
            extra: .value(true)
        )
    }
}
