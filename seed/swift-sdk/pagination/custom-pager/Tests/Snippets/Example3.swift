import Foundation
import Pagination

enum Example3 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.inlineUsers.inlineUsers.listWithBodyCursorPagination(request: .init(pagination: WithCursor(
            cursor: "cursor"
        )))
    }
}
