import Foundation
import Pagination

enum Example4 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.inlineUsers.inlineUsers.listWithOffsetPagination(
            page: 1,
            perPage: 1,
            order: .asc,
            startingAfter: "starting_after"
        )
    }
}
