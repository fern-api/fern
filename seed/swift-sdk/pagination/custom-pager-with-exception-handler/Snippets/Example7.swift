import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.inlineUsers.inlineUsers.listWithOffsetStepPagination(
        page: 1,
        limit: 1,
        order: .asc
    )
}

try await main()
