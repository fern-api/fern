import Foundation
import Pagination

enum Example15 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.users.listWithBodyCursorPagination(request: .init(pagination: WithCursorType(
            cursor: "cursor"
        )))
    }
}
