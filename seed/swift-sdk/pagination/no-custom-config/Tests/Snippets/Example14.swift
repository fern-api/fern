import Foundation
import Pagination

enum Example14 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithMixedTypeCursorPagination(cursor: "cursor")
    }
}
