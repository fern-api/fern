import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination(cursor: "cursor")
}

try await main()
