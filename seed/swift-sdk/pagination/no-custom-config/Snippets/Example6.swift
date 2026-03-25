import Foundation
import Pagination

private func main() async throws {
    let client = PaginationClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.inlineUsers.inlineUsers.listWithBodyOffsetPagination(request: .init(pagination: WithPage(
        page: 1
    )))
}

try await main()
