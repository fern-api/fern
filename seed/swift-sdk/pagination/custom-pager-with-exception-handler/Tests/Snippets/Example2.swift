import Foundation
import Pagination

enum Example2 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination(cursor: "cursor")
    }
}
