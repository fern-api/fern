import Foundation
import NullableOptional

enum Example4 {
    static func snippet() async throws {
        let client = NullableOptionalClient(baseURL: "https://api.fern.com")

        _ = try await client.nullableOptional.searchUsers(
            query: "query",
            department: .value("department"),
            role: "role",
            isActive: .value(true)
        )
    }
}
