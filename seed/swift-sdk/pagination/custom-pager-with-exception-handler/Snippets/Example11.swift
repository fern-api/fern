import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.inlineUsers.inlineUsers.listWithCursorPagination(startingAfter: "starting_after")
}

try await main()
