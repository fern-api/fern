import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.inlineUsersInlineUsers.inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(
        page: .value(1),
        limit: .value(1),
        order: .asc
    )
}

try await main()
