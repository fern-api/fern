import Foundation
import NullableOptional

enum Example3 {
    static func snippet() async throws {
        let client = NullableOptionalClient(baseURL: "https://api.fern.com")

        _ = try await client.nullableOptional.listUsers(
            limit: 1,
            offset: 1,
            includeDeleted: true,
            sortBy: .value("sortBy")
        )
    }
}
