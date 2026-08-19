import Foundation
import Pagination

enum Example13 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithCursorPagination(
            page: 1,
            perPage: 1,
            order: .asc,
            startingAfter: "starting_after"
        )
    }
}
