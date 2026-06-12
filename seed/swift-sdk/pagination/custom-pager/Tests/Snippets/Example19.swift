import Foundation
import Pagination

enum Example19 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithDoubleOffsetPagination(
            page: 1.1,
            perPage: 1.1,
            order: .asc,
            startingAfter: "starting_after"
        )
    }
}
