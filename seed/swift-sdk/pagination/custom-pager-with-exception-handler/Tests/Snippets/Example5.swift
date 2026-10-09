import Foundation
import Pagination

enum Example5 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.inlineUsers.inlineUsers.listWithDoubleOffsetPagination(
            page: 1.1,
            perPage: 1.1,
            order: .asc,
            startingAfter: "starting_after"
        )
    }
}
