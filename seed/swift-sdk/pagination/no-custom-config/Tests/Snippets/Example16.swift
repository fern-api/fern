import Foundation
import Pagination

enum Example16 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithTopLevelBodyCursorPagination(request: .init(
            cursor: "initial_cursor",
            filter: "active"
        ))
    }
}
