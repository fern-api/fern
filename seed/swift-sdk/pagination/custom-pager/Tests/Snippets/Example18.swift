import Foundation
import Pagination

enum Example18 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithTopLevelBodyCursorPagination(request: .init(
            cursor: "cursor",
            filter: "filter"
        ))
    }
}
