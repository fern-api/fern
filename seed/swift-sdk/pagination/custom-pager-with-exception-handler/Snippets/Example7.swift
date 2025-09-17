import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.inlineUsers.inlineUsers.listWithOffsetStepPagination(request: .init(
        page: 1,
        limit: 1,
        order: .asc
    ))
}

try await main()
